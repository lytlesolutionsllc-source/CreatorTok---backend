import { Request, Response, NextFunction } from 'express';
import { fail } from '../types';

export interface AppError extends Error {
  status?: number;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal server error';

  if (status === 500) {
    console.error('[Error]', err);
  }

  res.status(status).json(fail(message));
}
