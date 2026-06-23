export type Role = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Trend {
  _id: string;
  title: string;
  source: string;
  score: number;
  category: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  carouselImages: string[];
  seoKeywords: string[];
  engagementHook?: string;
  cta?: string;
  provider?: "gemini" | "stable-diffusion" | "huggingface";
  status: "pending" | "scheduled" | "publishing" | "published" | "failed";
  createdAt: string;
}

export interface GeneratedContent {
  title: string;
  caption: string;
  hashtags: string[];
  carouselContent: string[];
  seoKeywords: string[];
  engagementHook: string;
  cta: string;
  imagePrompt: string;
}

export interface InstagramAccount {
  _id: string;
  instagramId: string;
  username: string;
  pageId: string;
  status: "connected" | "expired" | "disconnected";
}

export interface Schedule {
  _id: string;
  postId: Post;
  scheduledAt: string;
  timezone: string;
  frequency: "once" | "daily" | "weekly" | "monthly";
  status: "active" | "paused" | "completed" | "failed";
}

export interface AutoPilot {
  _id: string;
  instagramAccountId: string;
  niche: string;
  postsPerDay: number;
  postingTimes: string[];
  timezone: string;
  isActive: boolean;
  lastRunAt?: string;
  totalGenerated: number;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  failedPosts: number;
  connectedAccounts: number;
  aiGenerated: number;
  successRate: number;
  trendScore: number;
  topTrends: Trend[];
}
