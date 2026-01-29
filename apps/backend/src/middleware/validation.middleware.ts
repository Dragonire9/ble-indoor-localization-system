import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error-handler.middleware';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate the request data (Zod will throw if invalid)
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: Record<string, unknown>; params?: Record<string, string> };

      // Only update body if validated (query and params are read-only in Express)
      if (result.body) {
        req.body = result.body;
      }
      // Note: req.query and req.params are read-only in Express, so we don't modify them
      // The validation ensures they're correct, but we can't reassign them

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        const validationError = new AppError('Validation error', 400);
        (validationError as any).details = details;
        throw validationError;
      }
      next(error);
    }
  };
};
