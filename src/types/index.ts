import { Request } from 'express';

// ─── Extended Express Request ─────────────────────────────────────────────────

export interface AuthRequest extends Request {
  userId?: string;
}

// ─── API Response types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function fail(error: string): ApiResponse<never> {
  return { success: false, error };
}
