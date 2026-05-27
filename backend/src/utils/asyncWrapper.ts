/**
 * asyncWrapper.ts
 * Wraps an async Express handler so that any rejected promise is forwarded
 * to Express's next(err) — eliminating try/catch boilerplate in every
 * controller.
 *
 * Note: Express 5 handles async errors natively, but the wrapper keeps
 * the codebase compatible with both Express 4 and 5 and makes the intent explicit.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function asyncWrapper(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
