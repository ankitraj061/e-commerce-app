/**
 * errorHandler.middleware.ts
 * Global Express error handler. Must be registered LAST — after all routes.
 *
 * Distinguishes between:
 *   - ApiError (operational errors): structured response with the given status code
 *   - Prisma errors: mapped to readable messages
 *   - JWT errors: 401
 *   - Unknown errors: 500 (never expose internals in production)
 */

import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = jwt;
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── 1. Operational errors (ApiError) ─────────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // ── 2. Prisma known errors ────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") ?? "field";
      res.status(409).json({
        success: false,
        error: `A record with this ${field} already exists.`,
      });
      return;
    }

    // P2025: Record not found (findUniqueOrThrow, updateOrThrow, etc.)
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Record not found.",
      });
      return;
    }

    // P2003: Foreign key constraint failure
    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        error: "Related record does not exist.",
      });
      return;
    }

    // Generic Prisma known error
    res.status(400).json({
      success: false,
      error: "Database operation failed.",
      ...(env.NODE_ENV !== "production" && { details: err.message }),
    });
    return;
  }

  // ── 3. JWT errors ─────────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, error: "Token expired." });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, error: "Invalid token." });
    return;
  }

  // ── 4. Unknown / programmer errors ───────────────────────────────────────────
  console.error("[ERROR]", err);

  res.status(500).json({
    success: false,
    error: "Internal server error.",
    ...(env.NODE_ENV !== "production" && {
      details: err instanceof Error ? err.message : String(err),
    }),
  });
}
