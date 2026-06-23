import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { audit } from "../middleware/audit.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  await audit(req, "auth.login", "User", result.user.id);
  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  res.json(await authService.refresh(req.body.refreshToken));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: "If the email exists, a reset link has been sent" });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: "Password has been reset" });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(String(req.query.token));
  res.json({ message: "Email verified" });
});
