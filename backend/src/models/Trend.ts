import mongoose, { Schema, type Document } from "mongoose";

export interface ITrend extends Document {
  title: string;
  source: string;
  score: number;
  category: string;
  url?: string;
  createdAt: Date;
}

const trendSchema = new Schema<ITrend>(
  {
    title: { type: String, required: true, index: true },
    source: { type: String, required: true },
    score: { type: Number, default: 0 },
    category: { type: String, default: "general" },
    url: String
  },
  { timestamps: true }
);

trendSchema.index({ title: 1, source: 1 }, { unique: true });

export const Trend = mongoose.model<ITrend>("Trend", trendSchema);
