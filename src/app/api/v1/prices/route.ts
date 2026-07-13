import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { priceQuerySchema } from '@/lib/schemas/public-gateway';
import { ReportsService } from '@/server/public-gateway/reports.service';
import { ReportsRepository } from '@/server/public-gateway/reports.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse } from '@/lib/types/api';

const repo = new ReportsRepository();
const service = new ReportsService(repo, new NpaClient());

function jsonOk<T>(data: T) {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>);
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { data: null, error: { code, message } } satisfies ApiResponse<never>,
    { status }
  );
}

export async function GET(request: NextRequest) {
  const rl = await rateLimitCheck('prices:GET', 200, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let validated;
  try {
    validated = priceQuerySchema.parse(query);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid query');
    throw e;
  }

  try {
    const prices = await service.getCurrentPrices(validated);
    return jsonOk({
      prices,
      lastUpdated: new Date().toISOString(),
      source: 'NPA',
    });
  } catch (error) {
    console.error('[Prices GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}