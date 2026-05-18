import { NextRequest, NextResponse } from 'next/server';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'strict-dynamic'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join('; ');

const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim());

const ALLOWED_ORIGINS = new Set(CORS_ORIGIN);

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip') || '127.0.0.1';
}

const SUSPICIOUS_PATTERNS = /\$(where|regex|ne|gt|lt|exists|eq|nin|in|all|or|and|nor|not)|eval\(|Function\(/i;

const RATE_LIMIT_CACHE = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const cached = RATE_LIMIT_CACHE.get(key);

  if (!cached || now > cached.resetAt) {
    RATE_LIMIT_CACHE.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  cached.count++;
  if (cached.count > max) {
    return { allowed: false, remaining: 0, resetAt: cached.resetAt };
  }

  return { allowed: true, remaining: max - cached.count, resetAt: cached.resetAt };
}

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/login': { max: 5, windowMs: 60000 },
  '/api/v2/auth/login': { max: 5, windowMs: 60000 },
  '/api/auth/register': { max: 3, windowMs: 60000 },
  '/api/v2/auth/register': { max: 3, windowMs: 60000 },
  '/api/appointments': { max: 20, windowMs: 60000 },
  '/api/v2/appointments': { max: 20, windowMs: 60000 },
  '/api/vouchers': { max: 30, windowMs: 60000 },
  '/api/v2/vouchers': { max: 30, windowMs: 60000 },
  '/api/cron': { max: 10, windowMs: 60000 },
  '/api/v2/cron': { max: 10, windowMs: 60000 },
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const response = NextResponse.next();

  // ── NoSQL Injection protection ─────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const url = req.nextUrl.search;
    if (SUSPICIOUS_PATTERNS.test(url)) {
      return NextResponse.json({ error: { code: 'SUSPICIOUS_PAYLOAD' } }, { status: 400 });
    }
  }

  // ── Cache Control (API responses should never be cached) ──────────────
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  // ── Security Headers ────────────────────────────────────────────────────
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Powered-By', '');

  // ── CORS ────────────────────────────────────────────────────────────────
  const origin = req.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Correlation-Id');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // ── Preflight ──────────────────────────────────────────────────────────
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: response.headers });
  }

  // ── Rate Limiting ──────────────────────────────────────────────────────
  for (const [prefix, limits] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      const ip = getClientIp(req);
      const key = `${prefix}:${ip}`;
      const result = checkRateLimit(key, limits.max, limits.windowMs);

      response.headers.set('X-RateLimit-Limit', String(limits.max));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

      if (!result.allowed) {
        return NextResponse.json(
          { error: { code: 'RATE_LIMIT', message: 'Too many requests', retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) } },
          { status: 429, headers: response.headers },
        );
      }
      break;
    }
  }

  // ── Correlation ID ─────────────────────────────────────────────────────
  if (!req.headers.get('x-correlation-id')) {
    response.headers.set('x-correlation-id', crypto.randomUUID());
  }

  // ── Remove Server header (information leak) ────────────────────────────
  response.headers.set('Server', '');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
