/**
 * apiResponse.ts
 * Standardised JSON response envelope used across all endpoints.
 *
 * Success:  { success: true,  data: T,      message?: string }
 * Error:    { success: false, error: string, details?: unknown }
 */

import { Response } from "express";

interface SuccessPayload<T> {
  success: true;
  message?: string;
  data: T;
}

interface ErrorPayload {
  success: false;
  error: string;
  details?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): void {
  const body: SuccessPayload<T> = { success: true, data };
  if (message) body.message = message;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  details?: unknown
): void {
  const body: ErrorPayload = { success: false, error };
  if (details !== undefined) body.details = details;
  res.status(statusCode).json(body);
}
