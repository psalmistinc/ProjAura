import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { assetQuerySchema } from '@/lib/schemas/marketplace';
import { MarketplaceService, MarketplaceError } from '@/server/marketplace/marketplace.service';
import { MarketplaceRepository } from '@/server/marketplace/marketplace.repository';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { FabricClient } from '@/server/lib/fabric';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse, PaginationMeta } from '@/lib/types/api';

const repo = new MarketplaceRepository();
const claimsRepo = new ClaimsRepository();
const service = new MarketplaceService(repo, claimsRepo, new FabricClient());

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
  const rl = await rateLimitCheck('marketplace:assets:GET', 100, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let validated;
  try {
    validated = assetQuerySchema.parse(query);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid query');
    throw e;
  }

  try {
    const result = await service.getAssets(validated);
    return jsonOk(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.count,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[Assets GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}