import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string): ApiResponse {
  return { success: false, error };
}
