import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5001),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:5001"),
  MONGO_URI: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(12),
  JWT_REFRESH_SECRET: z.string().min(12),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(15),
  EMAIL_VERIFY_EXPIRES_HOURS: z.coerce.number().default(24),
  META_APP_ID: z.string().optional().default(""),
  META_APP_SECRET: z.string().optional().default(""),
  META_REDIRECT_URI: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_TEXT_MODEL: z.string().default("gemini-1.5-flash"),
  GEMINI_IMAGE_MODEL: z.string().default("gemini-2.0-flash-preview-image-generation"),
  STABLE_DIFFUSION_API_URL: z.string().optional().default(""),
  STABLE_DIFFUSION_API_KEY: z.string().optional().default(""),
  HUGGINGFACE_API_KEY: z.string().optional().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  FROM_EMAIL: z.string().email().default("no-reply@example.com"),
  LOG_LEVEL: z.string().default("info")
});

export const env = envSchema.parse(process.env);
