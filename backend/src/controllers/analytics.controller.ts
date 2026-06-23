import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  res.json(await analyticsService.dashboard(req.user!.id));
});
