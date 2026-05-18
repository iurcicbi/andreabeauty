import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid ObjectId');

export const phoneNumber = z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number');

export const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)');

export const dateString = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

export const emailOptional = z.string().email().optional().or(z.literal(''));

type SchemaMap = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

export function validate(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.join('.');
          (errors[path] ||= []).push(issue.message);
        }
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.join('.');
          (errors[`query.${path}`] ||= []).push(issue.message);
        }
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.join('.');
          (errors[`params.${path}`] ||= []).push(issue.message);
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    next();
  };
}
