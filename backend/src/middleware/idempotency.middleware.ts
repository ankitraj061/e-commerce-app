
import { Request, Response, NextFunction, RequestHandler } from "express";
import crypto from "crypto";
import { redis } from "../config/redis.js";

const IDEMPOTENCY_TTL_SECONDS = 86_400; 

interface CachedResponse {
  requestHash: string;
  statusCode: number;
  response: unknown;
}

export function idempotencyMiddleware(prefix: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

    
    if (!idempotencyKey) {
      next();
      return;
    }

    
    if (idempotencyKey.length > 128) {
      res.status(400).json({
        success: false,
        error: "Idempotency-Key must not exceed 128 characters.",
      });
      return;
    }

    
    const bodyString = JSON.stringify(req.body ?? {});
    const requestHash = crypto
      .createHash("sha256")
      .update(bodyString)
      .digest("hex");

    const redisKey = `${prefix}:${idempotencyKey}`;

    
    const cached = await redis.get<CachedResponse>(redisKey);

    if (cached) {
      
      if (cached.requestHash !== requestHash) {
        res.status(409).json({
          success: false,
          error:
            "Idempotency key reused with a different request payload. Use a new key.",
        });
        return;
      }

      
      res.status(cached.statusCode).json(cached.response);
      return;
    }

    
    req.idempotencyKey = idempotencyKey;
    req.idempotencyHash = requestHash;

    
    const originalJson = res.json.bind(res) as Response["json"];

    res.json = function (body: unknown): Response {
      const statusCode = res.statusCode;

      
      
      
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
