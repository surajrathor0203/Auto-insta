import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IInstagramAccount extends Document {
  userId: Types.ObjectId;
  instagramId: string;
  username: string;
  accessToken: string;
  pageId: string;
  status: "connected" | "expired" | "disconnected";
  tokenExpiresAt?: Date;
}

const instagramAccountSchema = new Schema<IInstagramAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instagramId: { type: String, required: true },
    username: { type: String, required: true },
    accessToken: { type: String, required: true, select: false },
    pageId: { type: String, required: true },
    status: { type: String, enum: ["connected", "expired", "disconnected"], default: "connected" },
    tokenExpiresAt: Date
  },
  { timestamps: true }
);

instagramAccountSchema.index({ userId: 1, instagramId: 1 }, { unique: true });

export const InstagramAccount = mongoose.model<IInstagramAccount>("InstagramAccount", instagramAccountSchema);
