import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = RATE_LIMIT_STORE.get(key);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_STORE.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    response.headers.set('Access-Control-Max-Age', '86400');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    let maxRequests = 100;
    let windowMs = 60_000;

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      maxRequests = 20;
    }

    if (pathname.includes('/auth/')) {
      maxRequests = 10;
      windowMs = 60_000;
    }

    const { allowed, remaining } = checkRateLimit(key, maxRequests, windowMs);
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers: response.headers }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
