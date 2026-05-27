/**
 * auth.middleware.ts
 * Protects routes by verifying the JWT access token from the
 * Authorization header (Bearer scheme).
 *
 * On success:  attaches decoded payload to req.user and calls next()
 * On failure:  returns 401 (missing/expired/invalid token)
 *
 * The refresh token lives in an HttpOnly cookie and is NEVER checked here —
 * it is only used in the dedicated POST /auth/refresh-token route.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../lib/jwt.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Provide a Bearer token.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: "Access token expired. Please refresh your token.",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: "Invalid access token.",
      });
      return;
    }

    next(err); // Unexpected error → global handler
  }
}
