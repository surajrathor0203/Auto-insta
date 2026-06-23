import type { Request, Response } from "express";
import { trendService } from "../trends/trend.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTrends = asyncHandler(async (req: Request, res: Response) => {
  const trends = await trendService.list({ category: req.query.category as string, limit: Number(req.query.limit ?? 50) });
  res.json({ trends });
});

export const refreshTrends = asyncHandler(async (_req: Request, res: Response) => {
  const trends = await trendService.fetchAndStore();
  res.json({ count: trends.length });
});
