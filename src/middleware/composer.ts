import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import crypto from 'crypto';
import { verifyAccessToken, generateFingerprint } from '../security/jwt';
import { logger } from '../logging/logger';
import { createAuditLog } from '../logging/audit';
import type { AuthUser, Permission, UserRole } from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/auth';

function getCSRFSecret(): string {
  if (!process.env.CSRF_SECRET) {
    throw new Error('❌ CSRF_SECRET non configurata. Imposta la variabile d\'ambiente CSRF_SECRET.');
  }
  return process.env.CSRF_SECRET;
}

const SUSPICIOUS_PATTERNS = /\$(where|regex|ne|gt|lt|exists|eq|nin|in|all|or|and|nor|not)|eval\(|Function\(/i;

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 60000 },
  booking: { max: 20, windowMs: 60000 },
  admin: { max: 30, windowMs: 60000 },
  whatsapp: { max: 10, windowMs: 60000 },
  otp: { max: 3, windowMs: 60000 },
};

const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

interface ComposedHandlerContext {
  user?: AuthUser;
  body: unknown;
  query: Record<string, string>;
  params: Record<string, string>;
  correlationId: string;
}

type ComposedHandler = (ctx: ComposedHandlerContext, req: NextRequest) => Promise<NextResponse>;

interface ComposerOptions {
  auth?: boolean;
  permissions?: Permission[];
  roles?: UserRole[];
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  rateLimit?: 'login' | 'booking' | 'admin' | 'whatsapp' | 'otp';
  csrf?: boolean;
  audit?: {
    action: string;
    target: string;
    getTargetId?: (ctx: ComposedHandlerContext) => string | undefined;
    getBefore?: (ctx: ComposedHandlerContext) => Record<string, unknown> | undefined;
    getAfter?: (ctx: ComposedHandlerContext) => Record<string, unknown> | undefined;
  };
}

function hasNestedSuspiciousPattern(value: unknown): boolean {
  if (typeof value === 'string') {
    return SUSPICIOUS_PATTERNS.test(value);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(v => hasNestedSuspiciousPattern(v));
  }
  return false;
}

function validateCSRF(req: NextRequest): boolean {
  const method = req.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

  const csrfCookie = req.cookies.get('csrf-token')?.value;
  const csrfHeader = req.headers.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader) return false;

  const expected = crypto.createHmac('sha256', getCSRFSecret())
    .update(csrfCookie).digest('hex').slice(0, 32);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(csrfHeader));
}

function checkRateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const cached = rateLimitCache.get(key);

  if (!cached || now > cached.resetAt) {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  cached.count++;
  return {
    allowed: cached.count <= max,
    remaining: Math.max(0, max - cached.count),
    resetAt: cached.resetAt,
  };
}

export function compose(handler: ComposedHandler, options: ComposerOptions = {}) {
  return async (req: NextRequest, context?: { params: Record<string, string> }): Promise<NextResponse> => {
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
    const startTime = Date.now();
    const ctx: ComposedHandlerContext = {
      body: {},
      query: Object.fromEntries(req.nextUrl.searchParams.entries()),
      params: context?.params || {},
      correlationId,
    };

    try {
      // ── NoSQL Injection protection ────────────────────────────────────
      try {
        const raw = !['GET', 'HEAD', 'OPTIONS', 'DELETE'].includes(req.method)
          ? await req.clone().json().catch(() => ({})) : {};
        const sources = [raw, Object.fromEntries(req.nextUrl.searchParams.entries())];
        for (const source of sources) {
          if (hasNestedSuspiciousPattern(source)) {
            logger.warn({ msg: 'NoSQL injection attempt blocked', correlationId, ip: req.headers.get('x-forwarded-for') });
            return NextResponse.json(
              { error: { code: 'SUSPICIOUS_PAYLOAD', message: 'Payload blocked', correlationId } },
              { status: 400 },
            );
          }
        }
      } catch {}

      // ── CSRF Protection ───────────────────────────────────────────────
      if (options.csrf) {
        if (!validateCSRF(req)) {
          logger.warn({ msg: 'CSRF validation failed', correlationId, path: req.nextUrl.pathname });
          return NextResponse.json(
            { error: { code: 'CSRF_ERROR', message: 'Invalid CSRF token', correlationId } },
            { status: 403 },
          );
        }
      }

      // ── Rate Limiting ─────────────────────────────────────────────────
      if (options.rateLimit) {
        const limits = RATE_LIMITS[options.rateLimit];
        if (limits) {
          const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
          const key = `${options.rateLimit}:${ip}`;
          const result = checkRateLimit(key, limits.max, limits.windowMs);

          if (!result.allowed) {
            logger.warn({ msg: 'Rate limit exceeded', type: options.rateLimit, ip, correlationId });
            return NextResponse.json(
              {
                error: {
                  code: 'RATE_LIMIT',
                  message: 'Too many requests',
                  retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
                  correlationId,
                },
              },
              {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': String(limits.max),
                  'X-RateLimit-Remaining': '0',
                  'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                },
              },
            );
          }
        }
      }

      // ── Auth ──────────────────────────────────────────────────────────
      if (options.auth) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return NextResponse.json(
            { error: { code: 'AUTHENTICATION_ERROR', message: 'Missing or invalid token', correlationId } },
            { status: 401 },
          );
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);

        const currentFingerprint = generateFingerprint({
          headers: {
            'user-agent': req.headers.get('user-agent') || '',
            'accept-language': req.headers.get('accept-language') || '',
          },
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        });

        if (payload.fingerprint !== currentFingerprint) {
          logger.warn({ msg: 'Fingerprint mismatch', userId: payload.sub, correlationId });
          return NextResponse.json(
            { error: { code: 'AUTHENTICATION_ERROR', message: 'Session fingerprint mismatch', correlationId } },
            { status: 401 },
          );
        }

        ctx.user = { id: payload.sub, role: payload.role, permissions: payload.permissions };
      }

      // ── Roles ─────────────────────────────────────────────────────────
      if (options.roles && ctx.user) {
        if (!options.roles.includes(ctx.user.role)) {
          logger.warn({ msg: 'Role denied', userId: ctx.user.id, role: ctx.user.role, required: options.roles, correlationId });
          return NextResponse.json(
            { error: { code: 'AUTHORIZATION_ERROR', message: 'Insufficient role', correlationId } },
            { status: 403 },
          );
        }
      }

      // ── Permissions ───────────────────────────────────────────────────
      if (options.permissions && ctx.user) {
        const isSuperAdmin = ctx.user.permissions.includes('*' as Permission);
        const hasAll = options.permissions.every(p => isSuperAdmin || ctx.user!.permissions.includes(p));
        if (!hasAll) {
          logger.warn({ msg: 'Permission denied', userId: ctx.user.id, required: options.permissions, correlationId });
          return NextResponse.json(
            { error: { code: 'AUTHORIZATION_ERROR', message: 'Insufficient permissions', correlationId } },
            { status: 403 },
          );
        }
      }

      // ── Body validation ───────────────────────────────────────────────
      if (options.bodySchema) {
        try {
          const raw = await req.json();
          const parsed = options.bodySchema.parse(raw);
          ctx.body = parsed;
        } catch (err: any) {
          if (err?.issues) {
            const details: Record<string, string[]> = {};
            for (const issue of err.issues) {
              const path = issue.path.join('.');
              (details[path] ||= []).push(issue.message);
            }
            return NextResponse.json(
              { error: { code: 'VALIDATION_ERROR', details, correlationId } },
              { status: 400 },
            );
          }
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body', correlationId } },
            { status: 400 },
          );
        }
      }

      // ── Query validation ──────────────────────────────────────────────
      if (options.querySchema) {
        const parsed = options.querySchema.safeParse(ctx.query);
        if (!parsed.success) {
          const details: Record<string, string[]> = {};
          for (const issue of parsed.error.issues) {
            const path = issue.path.join('.');
            (details[path] ||= []).push(issue.message);
          }
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', details, correlationId } },
            { status: 400 },
          );
        }
        ctx.query = parsed.data as Record<string, string>;
      }

      // ── Handler ───────────────────────────────────────────────────────
      const response = await handler(ctx, req);

      // ── Audit log ─────────────────────────────────────────────────────
      if (options.audit && ctx.user) {
        createAuditLog({
          userId: ctx.user.id,
          action: options.audit.action as any,
          target: options.audit.target,
          targetId: options.audit.getTargetId?.(ctx),
          before: options.audit.getBefore?.(ctx),
          after: options.audit.getAfter?.(ctx),
          ip: req.headers.get('x-forwarded-for') || undefined,
          userAgent: req.headers.get('user-agent') || undefined,
          correlationId,
        });
      }

      // ── Structured log ───────────────────────────────────────────────
      const duration = Date.now() - startTime;
      logger.info({
        msg: `${req.method} ${req.nextUrl.pathname}`,
        method: req.method,
        path: req.nextUrl.pathname,
        status: response.status,
        duration,
        userId: ctx.user?.id,
        correlationId,
      });

      return response;

    } catch (err: any) {
      const duration = Date.now() - startTime;
      logger.error({
        msg: `Unhandled error: ${err.message}`,
        method: req.method,
        path: req.nextUrl.pathname,
        duration,
        correlationId,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });

      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
            correlationId,
          },
        },
        { status: 500 },
      );
    }
  };
}
