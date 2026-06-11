import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import { env } from '../config/env';

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'strict-dynamic'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:'],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  frameAncestors: ["'none'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
};

export const helmetMiddleware = helmet({
  contentSecurityPolicy: { directives: CSP_DIRECTIVES },
  xFrameOptions: { action: 'deny' },
  hidePoweredBy: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

let _corsMiddleware: any;
export function getCorsMiddleware() {
  if (!_corsMiddleware) {
    _corsMiddleware = cors({
      origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Correlation-Id'],
      maxAge: 86400,
    });
  }
  return _corsMiddleware;
}

export const hppMiddleware = hpp({
  whitelist: ['page', 'limit', 'sort'],
});

export function requestSizeLimit(maxBytes = 1024 * 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request too large' } });
      return;
    }
    next();
  };
}

const SUSPICIOUS_PATTERNS = [
  /\$where/i,
  /\$regex/i,
  /\$ne/i,
  /\$gt/i,
  /\$lt/i,
  /\$exists/i,
  /eval\(/i,
  /Function\(/i,
];

function hasSuspiciousPattern(value: unknown): boolean {
  if (typeof value === 'string') {
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(value));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(v => hasSuspiciousPattern(v));
  }
  return false;
}

export function noSqlInjectionProtection(req: Request, _res: Response, next: NextFunction): void {
  const sources = [req.body, req.query, req.params];
  for (const source of sources) {
    if (hasSuspiciousPattern(source)) {
      throw new Error('Suspicious payload detected');
    }
  }
  next();
}

const BLOCKED_MIME_TYPES = [
  'application/x-javascript',
  'text/javascript',
  'application/javascript',
  'application/ecmascript',
  'text/ecmascript',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-sh',
  'application/x-csh',
  'application/x-python-code',
];

export function validateMimeType(mimeType: string): boolean {
  return !BLOCKED_MIME_TYPES.includes(mimeType);
}
