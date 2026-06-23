import cron from "node-cron";
import { AutoPilot, type IAutoPilot } from "../models/AutoPilot.js";
import { Post } from "../models/Post.js";
import { Schedule } from "../models/Schedule.js";
import { Trend } from "../models/Trend.js";
import { trendService } from "../trends/trend.service.js";
import { geminiService } from "../ai/gemini.service.js";
import { imageService } from "../ai/image.service.js";
import { schedulePublishingJob } from "./publish.queue.js";
import { logger } from "../utils/logger.js";
import type { Document } from "mongoose";

// Generic content pillars used when no trend data is available at all
const FALLBACK_TOPICS = [
  "productivity hacks", "morning routines", "mindset shifts",
  "growth strategies", "social media tips", "content creation secrets",
  "business lessons", "personal development", "success habits", "motivation"
];

export async function runAutopilotForUser(autopilot: IAutoPilot & Document, overridePostingTimes?: string[]) {
  // Fetch ALL post titles ever created for this user to guarantee no duplicates
  const allPosts = await Post.find({ userId: autopilot.userId }).select("title trendId");
  const usedTrendIds = new Set(allPosts.map((p) => p.trendId?.toString()).filter(Boolean));
  // Keep as a mutable Set so titles generated this run are added immediately
  const usedTitles = new Set(allPosts.map((p) => p.title.toLowerCase()));

  // Get all trends, exclude already-used ones
  let allTrends = await Trend.find().sort({ score: -1 }).limit(200);

  // If DB is empty (cron hasn't run yet today), fetch fresh trends now
  if (allTrends.length === 0) {
    logger.info("Autopilot: no trends in DB, fetching fresh ones now", { userId: autopilot.userId });
    try {
      await trendService.fetchAndStore();
      allTrends = await Trend.find().sort({ score: -1 }).limit(200);
    } catch (fetchError) {
      logger.warn("Autopilot: trend fetch failed, will use fallback topics", { fetchError });
    }
  }

  const freshTrends = allTrends.filter(
    (t) => !usedTrendIds.has(t.id) && !usedTitles.has(t.title.toLowerCase())
  );

  // If all DB trends are used, recycle them
  if (freshTrends.length === 0 && allTrends.length > 0) {
    logger.warn("Autopilot: all trends already used, recycling older ones", { userId: autopilot.userId });
    freshTrends.push(...allTrends.slice(0, autopilot.postsPerDay));
  }

  const results: Array<{ postId: string; scheduledAt: Date; title: string }> = [];
  const now = new Date();

  for (let i = 0; i < autopilot.postsPerDay; i++) {
    // Pick trend or fall back to generic topic strings
    const trend = freshTrends.length > 0 ? freshTrends[i % freshTrends.length] : null;
    const topicTitle = trend?.title ?? FALLBACK_TOPICS[(allPosts.length + i) % FALLBACK_TOPICS.length];
    const postingTimes = overridePostingTimes ?? autopilot.postingTimes;
    const timeStr = postingTimes[i] ?? postingTimes[postingTimes.length - 1] ?? `${9 + i * 3}:00`;
    const [hours, minutes] = timeStr.split(":").map(Number);

    const scheduledAt = new Date(now);
    scheduledAt.setHours(hours, minutes ?? 0, 0, 0);
    // If the time already passed today, schedule for tomorrow
    if (scheduledAt <= now) scheduledAt.setDate(scheduledAt.getDate() + 1);

    try {
      logger.info("Autopilot: generating post", { topic: topicTitle, niche: autopilot.niche, slot: i + 1 });

      // Retry up to 3 times if the generated title already exists
      let content = await geminiService.generateContent(autopilot.niche, topicTitle);
      let attempt = 1;
      while (usedTitles.has(content.title.toLowerCase()) && attempt < 3) {
        logger.warn("Autopilot: duplicate title detected, regenerating", { title: content.title, attempt });
        // Pass a hint so Gemini picks a genuinely different angle
        content = await geminiService.generateContent(
          autopilot.niche,
          `${topicTitle} — different angle, avoid title: "${content.title}"`
        );
        attempt++;
      }
      if (usedTitles.has(content.title.toLowerCase())) {
        logger.warn("Autopilot: could not produce unique title after 3 attempts, skipping slot", { title: content.title });
        continue;
      }
      // Register title immediately so subsequent slots in this run don't collide
      usedTitles.add(content.title.toLowerCase());

      const imageUrls = await imageService.generate(
        content.imagePrompt,
        "huggingface",
        1,
        content.title,
        content.engagementHook
      );

      const post = await Post.create({
        userId: autopilot.userId,
        instagramAccountId: autopilot.instagramAccountId,
        ...(trend ? { trendId: trend._id } : {}),
        title: content.title,
        caption: content.caption,
        hashtags: content.hashtags,
        imageUrl: imageUrls[0],
        carouselImages: imageUrls,
        seoKeywords: content.seoKeywords,
        engagementHook: content.engagementHook,
        cta: content.cta,
        provider: "huggingface",
        status: "pending"
      });

      const schedule = await Schedule.create({
        userId: autopilot.userId,
        postId: post._id,
        scheduledAt,
        timezone: autopilot.timezone,
        frequency: "once",
        status: "active"
      });

      const jobId = await schedulePublishingJob(schedule);
      schedule.jobId = jobId;
      await schedule.save();
      await Post.findByIdAndUpdate(post._id, { status: "scheduled" });

      results.push({ postId: post.id, scheduledAt, title: content.title });
      logger.info("Autopilot: post scheduled", { title: content.title, scheduledAt });
    } catch (error) {
      logger.error("Autopilot: post generation failed", { error, topic: topicTitle, slot: i + 1 });
    }
  }

  await AutoPilot.findByIdAndUpdate(autopilot._id, {
    lastRunAt: new Date(),
    $inc: { totalGenerated: results.length }
  });

  return results;
}

export function startAutopilotCron() {
  // Runs at 06:30 AM daily — after the trend cron (06:00) has refreshed trends
  cron.schedule("30 6 * * *", async () => {
    logger.info("Autopilot cron: starting daily run");
    try {
      const activeAutopilots = await AutoPilot.find({ isActive: true });
      logger.info(`Autopilot cron: ${activeAutopilots.length} active configs found`);

      for (const autopilot of activeAutopilots) {
        // Skip if already ran today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (autopilot.lastRunAt && autopilot.lastRunAt >= today) {
          logger.info("Autopilot cron: already ran today, skipping", { userId: autopilot.userId });
          continue;
        }
        await runAutopilotForUser(autopilot);
      }
    } catch (error) {
      logger.error("Autopilot cron: failed", { error });
    }
  });
}
