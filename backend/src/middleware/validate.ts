import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success) {
      return next(new ApiError(422, "Validation failed", parsed.error.flatten()));
    }
    req.body = parsed.data.body ?? req.body;
    next();
  };
}
