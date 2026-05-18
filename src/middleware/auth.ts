import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, generateFingerprint } from '../security/jwt';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';
import { logger } from '../logging/logger';
import type { Permission, AuthUser } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      correlationId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  const currentFingerprint = generateFingerprint(req);
  if (payload.fingerprint !== currentFingerprint) {
    logger.warn({
      msg: 'Session fingerprint mismatch',
      userId: payload.sub,
      ip: req.ip,
      path: req.path,
    });
    throw new AuthenticationError('Session fingerprint mismatch');
  }

  req.user = {
    id: payload.sub,
    role: payload.role,
    permissions: payload.permissions,
  };

  next();
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const isSuperAdmin = req.user.permissions.includes('*' as Permission);
    const hasAll = permissions.every(p => isSuperAdmin || req.user!.permissions.includes(p));

    if (!hasAll) {
      logger.warn({
        msg: 'Access denied',
        userId: req.user.id,
        role: req.user.role,
        requiredPermissions: permissions,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      throw new AuthorizationError(`Missing permissions: ${permissions.join(', ')}`);
    }

    next();
  };
}
