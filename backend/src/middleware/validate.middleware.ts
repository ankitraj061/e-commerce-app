
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";

type ValidationTarget = "body" | "params" | "query";

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = "body"
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    
    if (target === "body") req.body = result.data;
    if (target === "params") req.params = result.data as Record<string, string>;
    if (target === "query") req.query = result.data as Record<string, string>;

    next();
  };
}
