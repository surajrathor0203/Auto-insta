import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { hashToken, randomToken, signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { emailService } from "./email.service.js";

export class AuthService {
  async register(input: { name: string; email: string; password: string }) {
    const existing = await User.findOne({ email: input.email });
    if (existing) throw new ApiError(409, "Email is already registered");
    const user = await User.create(input);
    const verificationToken = randomToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + env.EMAIL_VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);
    await user.save();
    await emailService.sendVerification(user.email, verificationToken);
    return this.issueTokens(user);
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password +refreshTokenHash");
    if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; tokenId: string };
    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user || user.refreshTokenHash !== hashToken(payload.tokenId)) throw new ApiError(401, "Invalid refresh token");
    return this.issueTokens(user);
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email }).select("+passwordResetTokenHash");
    if (!user) return;
    const token = randomToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
    await user.save();
    await emailService.sendPasswordReset(email, token);
  }

  async resetPassword(token: string, password: string) {
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    }).select("+passwordResetTokenHash +password");
    if (!user) throw new ApiError(400, "Password reset token is invalid or expired");
    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  async verifyEmail(token: string) {
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationTokenHash");
    if (!user) throw new ApiError(400, "Email verification token is invalid or expired");
    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  private async issueTokens(user: IUser) {
    const tokenId = randomToken();
    user.refreshTokenHash = hashToken(tokenId);
    await user.save();
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user, tokenId)
    };
  }
}

export const authService = new AuthService();
