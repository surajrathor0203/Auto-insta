import cron from "node-cron";
import { trendService } from "../trends/trend.service.js";
import { logger } from "../utils/logger.js";

export function startTrendCron() {
  cron.schedule("0 6 * * *", async () => {
    try {
      const trends = await trendService.fetchAndStore();
      logger.info("Daily trends refreshed", { count: trends.length });
    } catch (error) {
      logger.error("Daily trends refresh failed", { error });
    }
  });
}
