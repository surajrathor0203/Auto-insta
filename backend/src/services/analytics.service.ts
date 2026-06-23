import { InstagramAccount } from "../models/InstagramAccount.js";
import { Post } from "../models/Post.js";
import { Trend } from "../models/Trend.js";

export class AnalyticsService {
  async dashboard(userId: string) {
    const [totalPosts, scheduledPosts, publishedPosts, failedPosts, connectedAccounts, aiGenerated, topTrends] = await Promise.all([
      Post.countDocuments({ userId }),
      Post.countDocuments({ userId, status: "scheduled" }),
      Post.countDocuments({ userId, status: "published" }),
      Post.countDocuments({ userId, status: "failed" }),
      InstagramAccount.countDocuments({ userId, status: "connected" }),
      Post.countDocuments({ userId, provider: { $exists: true } }),
      Trend.find().sort({ score: -1 }).limit(8)
    ]);
    const successRate = totalPosts ? Math.round((publishedPosts / totalPosts) * 100) : 0;
    const trendScore = topTrends.reduce((sum, trend) => sum + trend.score, 0);
    return { totalPosts, scheduledPosts, publishedPosts, failedPosts, connectedAccounts, aiGenerated, successRate, trendScore, topTrends };
  }
}

export const analyticsService = new AnalyticsService();
