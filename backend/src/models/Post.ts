import mongoose, { Schema, type Document, type Types } from "mongoose";

export type PostStatus = "pending" | "scheduled" | "publishing" | "published" | "failed";

export interface IPost extends Document {
  userId: Types.ObjectId;
  instagramAccountId?: Types.ObjectId;
  trendId?: Types.ObjectId;
  title: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  carouselImages: string[];
  seoKeywords: string[];
  engagementHook?: string;
  cta?: string;
  provider?: "gemini" | "stable-diffusion" | "huggingface";
  status: PostStatus;
  publishedAt?: Date;
  failureReason?: string;
}

const postSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instagramAccountId: { type: Schema.Types.ObjectId, ref: "InstagramAccount" },
    trendId: { type: Schema.Types.ObjectId, ref: "Trend" },
    title: { type: String, required: true },
    caption: { type: String, required: true },
    hashtags: [{ type: String }],
    imageUrl: String,
    carouselImages: [{ type: String }],
    seoKeywords: [{ type: String }],
    engagementHook: String,
    cta: String,
    provider: { type: String, enum: ["gemini", "stable-diffusion", "huggingface"] },
    status: { type: String, enum: ["pending", "scheduled", "publishing", "published", "failed"], default: "pending" },
    publishedAt: Date,
    failureReason: String
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", postSchema);
