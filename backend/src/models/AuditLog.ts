import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, index: true },
    entity: String,
    entityId: String,
    ip: String,
    userAgent: String,
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
