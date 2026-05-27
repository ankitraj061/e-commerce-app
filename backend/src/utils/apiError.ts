/**
 * apiError.ts
 * Custom error class that carries an HTTP status code.
 * Throwing ApiError inside any route handler / service causes the
 * global error handler to return a structured JSON error response.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational; // false = programmer error → 500

    // Maintain proper prototype chain in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
