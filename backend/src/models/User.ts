import bcrypt from "bcryptjs";
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "admin" | "user";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  refreshTokenHash?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: Date,
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
