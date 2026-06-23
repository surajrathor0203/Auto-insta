import type { Request, Response } from "express";
import { AutoPilot } from "../models/AutoPilot.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAutopilotForUser } from "../jobs/autopilot.cron.js";
import { logger } from "../utils/logger.js";

export const getAutopilot = asyncHandler(async (req: Request, res: Response) => {
  const autopilot = await AutoPilot.findOne({ userId: req.user!.id });
  res.json({ autopilot: autopilot ?? null });
});

export const saveAutopilot = asyncHandler(async (req: Request, res: Response) => {
  const { instagramAccountId, niche, postsPerDay, postingTimes, timezone } = req.body;
  const autopilot = await AutoPilot.findOneAndUpdate(
    { userId: req.user!.id },
    { instagramAccountId, niche, postsPerDay, postingTimes, timezone },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ autopilot });
});

export const toggleAutopilot = asyncHandler(async (req: Request, res: Response) => {
  const autopilot = await AutoPilot.findOne({ userId: req.user!.id });
  if (!autopilot) return res.status(404).json({ message: "Autopilot not configured yet" });
  autopilot.isActive = !autopilot.isActive;
  await autopilot.save();
  res.json({ autopilot });
});

export const triggerAutopilot = asyncHandler(async (req: Request, res: Response) => {
  const autopilot = await AutoPilot.findOne({ userId: req.user!.id });
  if (!autopilot) return res.status(404).json({ message: "Autopilot not configured" });
  const overrideTimes: string[] | undefined = Array.isArray(req.body.postingTimes) ? req.body.postingTimes : undefined;
  logger.info("Manual autopilot trigger", { userId: req.user!.id, overrideTimes });
  const results = await runAutopilotForUser(autopilot, overrideTimes);
  res.json({ generated: results.length, posts: results });
});
