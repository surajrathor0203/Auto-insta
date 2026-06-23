import { Queue, Worker, type JobsOptions } from "bullmq";
import { env } from "../config/env.js";
import { InstagramAccount } from "../models/InstagramAccount.js";
import { Post } from "../models/Post.js";
import type { ISchedule } from "../models/Schedule.js";
import { metaInstagramService } from "../instagram/meta.service.js";
import { logger } from "../utils/logger.js";

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined
};

export const publishQueue = new Queue("instagram-publish", { connection });

function repeatOptions(schedule: ISchedule): JobsOptions {
  const delay = Math.max(schedule.scheduledAt.getTime() - Date.now(), 0);
  if (schedule.frequency === "once") return { delay, jobId: schedule.id };
  const every = { daily: 86_400_000, weekly: 604_800_000, monthly: 2_592_000_000 }[schedule.frequency];
  return { delay, repeat: { every }, jobId: schedule.id };
}

export async function schedulePublishingJob(schedule: ISchedule) {
  const job = await publishQueue.add("publish", { scheduleId: schedule.id, postId: schedule.postId.toString() }, repeatOptions(schedule));
  return job.id;
}

export function startPublishWorker() {
  return new Worker(
    "instagram-publish",
    async (job) => {
      const post = await Post.findById(job.data.postId);
      if (!post) return;
      try {
        post.status = "publishing";
        await post.save();
        const account = await InstagramAccount.findById(post.instagramAccountId).select("+accessToken");
        if (!account) throw new Error("Instagram account not found");
        if (!post.imageUrl) throw new Error("Post image is required for Instagram publishing");
        await metaInstagramService.publish({
          instagramId: account.instagramId,
          accessToken: account.accessToken,
          imageUrl: post.imageUrl,
          caption: `${post.caption}\n\n${post.hashtags.join(" ")}`
        });
        post.status = "published";
        post.publishedAt = new Date();
        post.failureReason = undefined;
        await post.save();
      } catch (error) {
        post.status = "failed";
        post.failureReason = error instanceof Error ? error.message : "Unknown publishing failure";
        await post.save();
        throw error;
      }
    },
    { connection }
  ).on("failed", (job, error) => logger.error("Publish job failed", { jobId: job?.id, error: error.message }));
}
