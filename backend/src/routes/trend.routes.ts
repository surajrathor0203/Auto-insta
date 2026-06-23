import { Router } from "express";
import { authorize } from "../middleware/auth.js";
import * as trends from "../controllers/trend.controller.js";

export const trendRoutes = Router();

trendRoutes.get("/", trends.listTrends);
trendRoutes.post("/refresh", authorize("admin"), trends.refreshTrends);
