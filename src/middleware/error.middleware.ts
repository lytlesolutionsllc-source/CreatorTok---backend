import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../types';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack);
  res.status(500).json(errorResponse(err.message || 'Internal server error'));
}
