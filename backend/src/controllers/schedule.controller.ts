import type { Request, Response } from "express";
import { Schedule } from "../models/Schedule.js";
import { Post } from "../models/Post.js";
import { schedulePublishingJob } from "../jobs/publish.queue.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await Schedule.create({ ...req.body, userId: req.user!.id });
  const jobId = await schedulePublishingJob(schedule);
  schedule.jobId = jobId;
  await schedule.save();
  const postUpdate: Record<string, unknown> = { status: "scheduled" };
  if (req.body.instagramAccountId) postUpdate.instagramAccountId = req.body.instagramAccountId;
  await Post.findOneAndUpdate({ _id: req.body.postId, userId: req.user!.id }, postUpdate);
  res.status(201).json({ schedule });
});

export const listSchedules = asyncHandler(async (req: Request, res: Response) => {
  const schedules = await Schedule.find({ userId: req.user!.id }).populate("postId").sort({ scheduledAt: 1 });
  res.json({ schedules });
});

export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await Schedule.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, req.body, { new: true });
  if (schedule) schedule.jobId = await schedulePublishingJob(schedule);
  await schedule?.save();
  res.json({ schedule });
});

export const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  await Schedule.deleteOne({ _id: req.params.id, userId: req.user!.id });
  res.status(204).send();
});
