import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import { env } from "../config/env.js";

const logDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: path.join(logDir, "app.log") }),
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" })
  ]
});
