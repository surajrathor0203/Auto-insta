import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IAutoPilot extends Document {
  userId: Types.ObjectId;
  instagramAccountId: Types.ObjectId;
  niche: string;
  postsPerDay: number;
  postingTimes: string[];
  timezone: string;
  isActive: boolean;
  lastRunAt?: Date;
  totalGenerated: number;
}

const autoPilotSchema = new Schema<IAutoPilot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    instagramAccountId: { type: Schema.Types.ObjectId, ref: "InstagramAccount", required: true },
    niche: { type: String, required: true },
    postsPerDay: { type: Number, required: true, min: 1, max: 10, default: 1 },
    postingTimes: [{ type: String }],
    timezone: { type: String, default: "UTC" },
    isActive: { type: Boolean, default: false },
    lastRunAt: { type: Date },
    totalGenerated: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const AutoPilot = mongoose.model<IAutoPilot>("AutoPilot", autoPilotSchema);
