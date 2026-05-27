/**
 * express.d.ts
 * Module augmentation for Express's Request object.
 * Adds the `user` property populated by the auth middleware after
 * JWT verification, and idempotency helpers used by the idempotency middleware.
 */

import "express";

declare module "express" {
  interface Request {
    /**
     * Populated by `authMiddleware` after successful JWT verification.
     * Contains the decoded access-token payload.
     */
    user?: {
      userId: string;
      email: string;
    };

    /**
     * Populated by `idempotencyMiddleware`.
     * The raw Idempotency-Key header value.
     */
    idempotencyKey?: string;

    /**
     * SHA-256 hex digest of the serialised request body.
     * Used to detect same-key / different-payload conflicts (409).
     */
    idempotencyHash?: string;
  }
}
