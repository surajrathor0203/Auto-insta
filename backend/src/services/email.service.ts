import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export class EmailService {
  async sendVerification(email: string, token: string) {
    const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
    logger.info("Email verification link generated", { email, url });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
    logger.info("Password reset link generated", { email, url });
  }
}

export const emailService = new EmailService();
