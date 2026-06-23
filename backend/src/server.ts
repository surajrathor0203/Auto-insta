import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { startAutopilotCron } from "./jobs/autopilot.cron.js";
import { startPublishWorker } from "./jobs/publish.queue.js";
import { startTrendCron } from "./jobs/trend.cron.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  await connectDatabase();
  startPublishWorker();
  startTrendCron();
  startAutopilotCron();
  app.listen(env.PORT, () => logger.info(`API running on port ${env.PORT}`));
}

bootstrap().catch((error) => {
  logger.error("Failed to start API", { error });
  process.exit(1);
});
