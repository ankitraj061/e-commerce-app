/**
 * idempotency.middleware.ts
 * Redis-backed idempotency layer for mutating endpoints.
 *
 * ─── WHY ────────────────────────────────────────────────────────────────────────
 * Network retries (client timeouts, mobile reconnects) can cause duplicate
 * POSTs. Without idempotency:
 *   - A reservation could be created twice for the same intent.
 *   - Stock could be double-decremented.
 * With idempotency, the SAME Idempotency-Key always returns the SAME response
 * without repeating the side-effect.
 *
 * ─── PROTOCOL ───────────────────────────────────────────────────────────────────
 * 1. Client sends `Idempotency-Key: <uuid>` header with every mutating request.
 * 2. Middleware checks Redis for key `{prefix}:{key}`.
 * 3. Cache HIT, same body hash  → return cached response (no DB side-effect).
 * 4. Cache HIT, different body  → 409 Conflict (key reused with different payload).
 * 5. Cache MISS → proceed; intercept res.json() to cache response before sending.
 *
 * ─── REDIS KEY FORMAT ────────────────────────────────────────────────────────────
 * idem:reserve:<idempotency-key>
 * idem:confirm:<idempotency-key>
 *
 * ─── STORED VALUE ────────────────────────────────────────────────────────────────
 * { requestHash: string, statusCode: number, response: unknown }
 * TTL: 86400 seconds (24 hours)
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import crypto from "crypto";
import { redis } from "../config/redis.js";

const IDEMPOTENCY_TTL_SECONDS = 86_400; // 24 hours

interface CachedResponse {
  requestHash: string;
  statusCode: number;
  response: unknown;
}

/**
 * Factory function — call with the Redis key prefix for the specific endpoint.
 *
 * @param prefix  e.g. "idem:reserve" or "idem:confirm"
 */
export function idempotencyMiddleware(prefix: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

    // If no key is supplied, skip idempotency (key is optional for non-critical paths)
    if (!idempotencyKey) {
      next();
      return;
    }

    // Reject absurdly long keys to prevent Redis key injection / memory DoS
    if (idempotencyKey.length > 128) {
      res.status(400).json({
        success: false,
        error: "Idempotency-Key must not exceed 128 characters.",
      });
      return;
    }

    // Compute a deterministic hash of the request body to detect payload changes
    const bodyString = JSON.stringify(req.body ?? {});
    const requestHash = crypto
      .createHash("sha256")
      .update(bodyString)
      .digest("hex");

    const redisKey = `${prefix}:${idempotencyKey}`;

    // ── Cache lookup ────────────────────────────────────────────────────────────
    const cached = await redis.get<CachedResponse>(redisKey);

    if (cached) {
      // Same key, DIFFERENT body → client error
      if (cached.requestHash !== requestHash) {
        res.status(409).json({
          success: false,
          error:
            "Idempotency key reused with a different request payload. Use a new key.",
        });
        return;
      }

      // Same key, same body → replay cached response (idempotent replay)
      res.status(cached.statusCode).json(cached.response);
      return;
    }

    // ── Cache MISS: attach key + hash to request, intercept response ────────────
    req.idempotencyKey = idempotencyKey;
    req.idempotencyHash = requestHash;

    // Monkey-patch res.json so we can capture the response before it goes out
    const originalJson = res.json.bind(res) as Response["json"];

    res.json = function (body: unknown): Response {
      const statusCode = res.statusCode;

      // BUG FIX: Never cache 5xx responses.
      // A 500 from a transient DB timeout should NOT be replayed forever.
      // Only cache 2xx and 4xx (those represent definitive outcomes).
      if (statusCode < 500) {
        const payload: CachedResponse = { requestHash, statusCode, response: body };
        redis
          .set(redisKey, payload, { ex: IDEMPOTENCY_TTL_SECONDS })
          .catch((err) =>
            console.error("[idempotency] Failed to cache response:", err)
          );
      }

      return originalJson(body);
    };

    next();
  };
}
