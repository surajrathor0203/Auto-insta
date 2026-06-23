import type { Request, Response } from "express";
import { InstagramAccount } from "../models/InstagramAccount.js";
import { metaInstagramService } from "../instagram/meta.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { audit } from "../middleware/audit.js";

export const oauthStart = asyncHandler(async (req: Request, res: Response) => {
  res.json({ url: metaInstagramService.getOAuthUrl(`${req.user!.id}:${Date.now()}`) });
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response) => {
  const state = String(req.query.state ?? "");
  const userId = state.split(":")[0];
  const data = await metaInstagramService.exchangeCode(String(req.query.code));
  const account = await InstagramAccount.findOneAndUpdate(
    { userId, instagramId: data.instagramId },
    { userId, ...data, status: "connected" },
    { upsert: true, new: true }
  );
  res.json({ account });
});

export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await InstagramAccount.find({ userId: req.user!.id }).select("-accessToken");
  res.json({ accounts });
});

export const disconnectAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await InstagramAccount.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { status: "disconnected" },
    { new: true }
  ).select("-accessToken");
  await audit(req, "instagram.disconnect", "InstagramAccount", req.params.id);
  res.json({ account });
});
