import Parser from "rss-parser";
import { Trend } from "../models/Trend.js";

const parser = new Parser();

const feeds = [
  { source: "Google Trends", category: "general", url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US" },
  { source: "Reddit Technology", category: "technology", url: "https://www.reddit.com/r/technology/.rss" },
  { source: "TechCrunch", category: "technology", url: "https://techcrunch.com/feed/" },
  { source: "BBC Business", category: "news", url: "https://feeds.bbci.co.uk/news/business/rss.xml" }
];

export class TrendService {
  async fetchAndStore() {
    const saved = [];
    for (const feed of feeds) {
      const parsed = await parser.parseURL(feed.url);
      for (const [index, item] of parsed.items.slice(0, 20).entries()) {
        const title = item.title?.trim();
        if (!title) continue;
        const trend = await Trend.findOneAndUpdate(
          { title, source: feed.source },
          { title, source: feed.source, category: feed.category, url: item.link, score: Math.max(100 - index * 4, 10) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        saved.push(trend);
      }
    }
    return saved;
  }

  list(query: { category?: string; limit?: number }) {
    return Trend.find(query.category ? { category: query.category } : {})
      .sort({ createdAt: -1, score: -1 })
      .limit(query.limit ?? 50);
  }
}

export const trendService = new TrendService();
