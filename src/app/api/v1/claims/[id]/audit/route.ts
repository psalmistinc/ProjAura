import { NextRequest, NextResponse } from 'next/server';
import { ClaimsRepository } from '@/server/claims/claims.repository';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse } from '@/lib/types/api';

const repo = new ClaimsRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rl = await rateLimitCheck(`claims:${id}:audit`, 100, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } satisfies ApiResponse<never>,
      { status: 429 }
    );
  }

  try {
    const auditLog = await repo.getAuditLog(id);
    return NextResponse.json({ data: auditLog, error: null } satisfies ApiResponse<typeof auditLog>);
  } catch (error) {
    console.error('[Audit GET]', error);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}