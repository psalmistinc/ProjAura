import { NextRequest, NextResponse } from 'next/server';
import { ClaimsService, ClaimError } from '@/server/claims/claims.service';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';
import { FabricClient } from '@/server/lib/fabric';
import { rateLimitCheck } from '@/server/lib/redis';
import { claimStatusUpdateSchema } from '@/lib/schemas/claims';
import { ZodError } from 'zod';
import type { ApiResponse } from '@/lib/types/api';

const repo = new ClaimsRepository();
const service = new ClaimsService(repo, new NpaClient(), new FabricClient());

function jsonOk<T>(data: T) {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>);
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { data: null, error: { code, message } } satisfies ApiResponse<never>,
    { status }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`claims:${id}:GET`, 100, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  try {
    const claim = await service.getClaimById(id);
    return jsonOk(claim);
  } catch (error) {
    if (error instanceof ClaimError) return jsonError(404, error.code, error.message);
    console.error('[Claims GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`claims:${id}:PATCH`, 30, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  let validated;
  try {
    validated = claimStatusUpdateSchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid status update');
    throw e;
  }

  try {
    let updated;
    switch (validated.status) {
      case 'PHYSICAL_DELIVERY_CONFIRMED':
        updated = await service.verifyPhysicalDelivery(id, 'validator-001');
        break;
      case 'VERIFIED_LOGGED':
        updated = await service.activateSLA(id);
        break;
      case 'PAID':
        updated = await service.markAsPaid(id, validated.verificationData?.fabricTxId as string || 'manual');
        break;
      default:
        updated = await repo.updateStatus(id, validated.status, 'admin-001', 'ADMIN', validated.verificationData);
    }
    return jsonOk(updated);
  } catch (error) {
    if (error instanceof ClaimError) return jsonError(422, error.code, error.message);
    console.error('[Claims PATCH]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}