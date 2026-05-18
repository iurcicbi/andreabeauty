import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { logger } from '../logging/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();

  if (err instanceof AppError) {
    logger.warn({
      msg: err.message,
      code: err.code,
      statusCode: err.statusCode,
      correlationId,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.isOperational ? err.message : 'Internal server error',
        ...('details' in err && { details: (err as any).details }),
        correlationId,
      },
    });
    return;
  }

  logger.error({
    msg: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    correlationId,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      correlationId,
    },
  });
}
