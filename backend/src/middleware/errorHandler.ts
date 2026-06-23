import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const details = error instanceof ApiError ? error.details : undefined;
  const message = error instanceof ApiError ? error.message : "Internal server error";
  logger.error(error.message, { stack: error.stack, path: req.originalUrl, requestId: req.requestId });
  res.status(statusCode).json({ message, details, requestId: req.requestId });
}
