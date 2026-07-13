import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { claimSubmissionSchema, claimQuerySchema } from '@/lib/schemas/claims';
import { ClaimsService, ClaimError } from '@/server/claims/claims.service';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';
import { FabricClient } from '@/server/lib/fabric';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse, PaginationMeta } from '@/lib/types/api';

const repo = new ClaimsRepository();
const npaClient = new NpaClient();
const fabricClient = new FabricClient();
const service = new ClaimsService(repo, npaClient, fabricClient);

function jsonOk<T>(data: T, meta?: PaginationMeta) {
  return NextResponse.json({ data, error: null, meta } satisfies ApiResponse<T>);
}

function jsonError(status: number, code: string, message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    { data: null, error: { code, message, details } } satisfies ApiResponse<never>,
    { status }
  );
}

export async function GET(request: NextRequest) {
  const rl = await rateLimitCheck('claims:GET', 100, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let validated;
  try {
    validated = claimQuerySchema.parse(query);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid query', e.flatten().fieldErrors as any);
    throw e;
  }

  try {
    const result = await service.getClaims(validated);
    return jsonOk(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.count,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[Claims GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimitCheck('claims:POST', 20, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  let validated;
  try {
    validated = claimSubmissionSchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid claim data', e.flatten().fieldErrors as any);
    throw e;
  }

  try {
    const claim = await service.submitClaim(validated, 'org-001');
    return jsonOk(claim);
  } catch (error) {
    if (error instanceof ClaimError) {
      return jsonError(422, error.code, error.message);
    }
    console.error('[Claims POST]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}