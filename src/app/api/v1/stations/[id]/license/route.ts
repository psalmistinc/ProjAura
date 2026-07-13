import { NextRequest, NextResponse } from 'next/server';
import { ReportsService, ReportError } from '@/server/public-gateway/reports.service';
import { ReportsRepository } from '@/server/public-gateway/reports.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse } from '@/lib/types/api';

const repo = new ReportsRepository();
const service = new ReportsService(repo, new NpaClient());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`station:${id}:license`, 100, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } satisfies ApiResponse<never>,
      { status: 429 }
    );
  }

  try {
    const station = await service.getStationLicenseStatus(id);
    return NextResponse.json({ data: station, error: null } satisfies ApiResponse<typeof station>);
  } catch (error) {
    if (error instanceof ReportError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }
    console.error('[Station License GET]', error);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}