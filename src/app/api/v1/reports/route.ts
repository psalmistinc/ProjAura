import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { reportSubmissionSchema, reportQuerySchema } from '@/lib/schemas/public-gateway';
import { ReportsService } from '@/server/public-gateway/reports.service';
import { ReportsRepository } from '@/server/public-gateway/reports.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';
import { rateLimitCheck } from '@/server/lib/redis';
import type { ApiResponse, PaginationMeta } from '@/lib/types/api';

const repo = new ReportsRepository();
const service = new ReportsService(repo, new NpaClient());

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
  const rl = await rateLimitCheck('reports:GET', 100, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let validated;
  try {
    validated = reportQuerySchema.parse(query);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid query');
    throw e;
  }

  try {
    const result = await service.getReports(validated);
    return jsonOk(result.data, {
      page: result.page,
      limit: result.limit,
      total: result.count,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[Reports GET]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}

export async function POST(request: NextRequest) {
  const rl = await rateLimitCheck('reports:POST', 10, 60);
  if (!rl.allowed) return jsonError(429, 'RATE_LIMITED', 'Too many requests');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  let validated;
  try {
    validated = reportSubmissionSchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, 'VALIDATION_ERROR', 'Invalid report data');
    throw e;
  }

  try {
    const report = await service.submitReport(validated);
    return jsonOk(report);
  } catch (error) {
    console.error('[Reports POST]', error);
    return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}