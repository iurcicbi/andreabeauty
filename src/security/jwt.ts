import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import { AuthenticationError } from '../errors/AppError';
import type { JwtPayload, RefreshTokenPayload } from '../types/auth';

function getAccessSecret(): string {
  return env.JWT_ACCESS_SECRET;
}
function getRefreshSecret(): string {
  return env.JWT_REFRESH_SECRET;
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, getAccessSecret(), {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload;
    if (decoded.type !== 'access') throw new Error('Invalid token type');
    return decoded;
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, getRefreshSecret(), {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');
    return decoded;
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
}

export function generateTokenId(): string {
  return randomBytes(32).toString('hex');
}

export function generateFingerprint(req: {
  headers: { 'user-agent'?: string; 'accept-language'?: string };
  ip?: string;
}): string {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.ip || '',
  ];
  const hash = require('crypto').createHash('sha256').update(components.join('|')).digest('hex');
  return hash;
}
