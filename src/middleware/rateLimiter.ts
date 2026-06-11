import { Request, Response, NextFunction } from 'express';

type LimitType = 'login' | 'booking' | 'admin' | 'whatsapp' | 'otp';

export function rateLimit(type: LimitType) {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    next();
  };
}
