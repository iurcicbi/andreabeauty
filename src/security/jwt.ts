import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import { AuthenticationError } from '../errors/AppError';
import type { JwtPayload, RefreshTokenPayload } from '../types/auth';

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== 'access') throw new Error('Invalid token type');
    return decoded;
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
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
