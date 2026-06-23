import mongoose, { Schema, type Document, type Types } from "mongoose";

export type ScheduleFrequency = "once" | "daily" | "weekly" | "monthly";

export interface ISchedule extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  scheduledAt: Date;
  timezone: string;
  frequency: ScheduleFrequency;
  status: "active" | "paused" | "completed" | "failed";
  jobId?: string;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    scheduledAt: { type: Date, required: true, index: true },
    timezone: { type: String, default: "UTC" },
    frequency: { type: String, enum: ["once", "daily", "weekly", "monthly"], default: "once" },
    status: { type: String, enum: ["active", "paused", "completed", "failed"], default: "active" },
    jobId: String
  },
  { timestamps: true }
);

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
