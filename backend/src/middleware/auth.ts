import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { User, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw new ApiError(401, "Authentication required");
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "Invalid authentication token");
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid authentication token"));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Insufficient permissions"));
    next();
  };
}
