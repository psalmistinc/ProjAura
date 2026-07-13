import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { bidSubmissionSchema, bidQuerySchema } from '@/lib/schemas/marketplace';
import { MarketplaceService, MarketplaceError } from '@/server/marketplace/marketplace.service';
import { MarketplaceRepository } from '@/server/marketplace/marketplace.repository';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { FabricClient } from '@/server/lib/fabric';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse, PaginationMeta } from '@/lib/types/api';

const repo = new MarketplaceRepository();
const service = new MarketplaceService(repo, new ClaimsRepository(), new FabricClient());

function jsonOk<T>(data: T, meta?: PaginationMeta) {
  return NextResponse.json({ data, error: null, meta } satisfies ApiResponse<T>);
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { data: null, error: { code, message } } satisfies ApiResponse<never>,
    { status }
  );
}

export async function GET(request: NextRequest) {
  const rl = await rateLimitCheck('marketplace:bids:GET', 100, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let validated;
  try {
    validated = bidQuerySchema.parse(query);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid query');
    throw e;
  }

  try {
    const result = await service.getBids(validated);
    return jsonOk(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.count,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[Bids GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimitCheck('marketplace:bids:POST', 10, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  let validated;
  try {
    validated = bidSubmissionSchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid bid data');
    throw e;
  }

  try {
    const result = await service.submitBid(validated, 'bank-001');
    return jsonOk(result);
  } catch (error) {
    if (error instanceof MarketplaceError) return jsonError(422, error.code, error.message);
    console.error('[Bids POST]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}