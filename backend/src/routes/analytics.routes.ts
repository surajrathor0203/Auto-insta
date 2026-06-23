import { Router } from "express";
import * as analytics from "../controllers/analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/dashboard", analytics.getDashboard);
