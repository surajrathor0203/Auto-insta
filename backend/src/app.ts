import "./types.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authenticate } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { autopilotRoutes } from "./routes/autopilot.routes.js";
import { oauthCallback } from "./controllers/instagram.controller.js";
import { instagramRoutes } from "./routes/instagram.routes.js";
import { postRoutes } from "./routes/post.routes.js";
import { scheduleRoutes } from "./routes/schedule.routes.js";
import { trendRoutes } from "./routes/trend.routes.js";

export const app = express();

app.use(requestId);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-instagram-auto-publisher" }));
app.use("/api/auth", authRoutes);
app.get("/api/instagram/oauth/callback", oauthCallback);
app.use("/api/instagram", authenticate, instagramRoutes);
app.use("/api/posts", authenticate, postRoutes);
app.use("/api/schedules", authenticate, scheduleRoutes);
app.use("/api/trends", authenticate, trendRoutes);
app.use("/api/analytics", authenticate, analyticsRoutes);
app.use("/api/autopilot", authenticate, autopilotRoutes);

app.use(notFound);
app.use(errorHandler);
