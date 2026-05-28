import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { env } from '../config/env';
import { RateLimitError } from '../errors/AppError';
import { logger } from '../logging/logger';

type LimitType = 'login' | 'booking' | 'admin' | 'whatsapp' | 'otp';

const LIMITS: Record<LimitType, { max: number; windowMs: number }> = {
  login: { max: env.RATE_LIMIT_MAX_LOGIN, windowMs: env.RATE_LIMIT_WINDOW_MS },
  booking: { max: env.RATE_LIMIT_MAX_BOOKING, windowMs: env.RATE_LIMIT_WINDOW_MS },
  admin: { max: env.RATE_LIMIT_MAX_ADMIN, windowMs: env.RATE_LIMIT_WINDOW_MS },
  whatsapp: { max: env.RATE_LIMIT_MAX_WHATSAPP, windowMs: 3600000 },
  otp: { max: 3, windowMs: 300000 },
};

let redisClient: ReturnType<typeof createClient> | null = null;

export async function initRateLimiter(): Promise<void> {
  if (env.REDIS_URL) {
    redisClient = createClient({ url: env.REDIS_URL });
    await redisClient.connect();
  }
}

export function rateLimit(type: LimitType) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!redisClient) {
      next();
      return;
    }

    const key = `ratelimit:${type}:${req.ip || req.socket.remoteAddress}`;
    const { max, windowMs } = LIMITS[type];

    try {
      const current = Number(await redisClient.incr(key));
      if (current === 1) {
        await redisClient.pExpire(key, windowMs);
      }

      const ttl = Number(await redisClient.pTtl(key));

      if (current > max) {
        logger.warn({
          msg: 'Rate limit exceeded',
          type,
          ip: req.ip,
          path: req.path,
          current,
          max,
        });

        throw new RateLimitError(Math.ceil(ttl / 1000));
      }

      _res.setHeader('X-RateLimit-Limit', max);
      _res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      _res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + ttl) / 1000));

      next();
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      logger.error({ msg: 'Rate limiter error', error: (err as Error).message });
      next();
    }
  };
}
