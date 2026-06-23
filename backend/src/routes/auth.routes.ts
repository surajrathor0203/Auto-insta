import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as auth from "../controllers/auth.controller.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } from "../validators/auth.validator.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), auth.register);
authRoutes.post("/login", validate(loginSchema), auth.login);
authRoutes.get("/me", authenticate, auth.me);
authRoutes.post("/refresh", validate(tokenSchema), auth.refresh);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), auth.forgotPassword);
authRoutes.post("/reset-password", validate(resetPasswordSchema), auth.resetPassword);
authRoutes.get("/verify-email", auth.verifyEmail);
