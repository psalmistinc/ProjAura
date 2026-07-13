import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceService, MarketplaceError } from '@/server/marketplace/marketplace.service';
import { MarketplaceRepository } from '@/server/marketplace/marketplace.repository';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { FabricClient } from '@/server/lib/fabric';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse } from '@/lib/types/api';

const repo = new MarketplaceRepository();
const service = new MarketplaceService(repo, new ClaimsRepository(), new FabricClient());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`marketplace:asset:${id}`, 100, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } satisfies ApiResponse<never>,
      { status: 429 }
    );
  }

  try {
    const asset = await service.getAssetById(id);
    return NextResponse.json({ data: asset, error: null } satisfies ApiResponse<typeof asset>);
  } catch (error) {
    if (error instanceof MarketplaceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }
    console.error('[Asset GET]', error);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`marketplace:asset:${id}:POST`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } satisfies ApiResponse<never>,
      { status: 429 }
    );
  }

  try {
    const asset = await service.listClaimOnMarketplace(id);
    return NextResponse.json(
      { data: asset, error: null } satisfies ApiResponse<typeof asset>,
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof MarketplaceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } } satisfies ApiResponse<never>,
        { status: 422 }
      );
    }
    console.error('[Asset POST]', error);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}