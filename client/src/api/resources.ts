import { http } from "./http";
import type { AutoPilot, DashboardStats, GeneratedContent, InstagramAccount, Post, Schedule, Trend } from "../types";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeGeneratedContent(content: Partial<GeneratedContent> | undefined): GeneratedContent {
  return {
    title: content?.title?.trim() || "Untitled post",
    caption: content?.caption?.trim() || "",
    hashtags: toStringArray(content?.hashtags),
    carouselContent: toStringArray(content?.carouselContent),
    seoKeywords: toStringArray(content?.seoKeywords),
    engagementHook: content?.engagementHook?.trim() || "",
    cta: content?.cta?.trim() || "",
    imagePrompt: content?.imagePrompt?.trim() || ""
  };
}

export const api = {
  dashboard: () => http.get<DashboardStats>("/api/analytics/dashboard").then((r) => r.data),
  trends: () => http.get<{ trends: Trend[] }>("/api/trends").then((r) => r.data.trends ?? []),
  posts: () => http.get<{ posts: Post[] }>("/api/posts").then((r) => r.data.posts ?? []),
  schedules: () => http.get<{ schedules: Schedule[] }>("/api/schedules").then((r) => r.data.schedules ?? []),
  accounts: () => http.get<{ accounts: InstagramAccount[] }>("/api/instagram").then((r) => r.data.accounts ?? []),
  instagramOAuth: () => http.get<{ url: string }>("/api/instagram/oauth/start").then((r) => r.data),
  generateContent: (body: { niche: string; trend: string }) =>
    http.post<{ content?: Partial<GeneratedContent> }>("/api/posts/generate-content", body).then((r) => normalizeGeneratedContent(r.data.content)),
  generateImages: (body: { prompt: string; provider: "gemini" | "stable-diffusion" | "huggingface"; count: number; overlayTitle?: string; overlayHook?: string }) =>
    http.post<{ images: string[] }>("/api/posts/generate-images", body).then((r) => r.data.images ?? []),
  createPost: (body: Partial<Post>) => http.post<{ post: Post }>("/api/posts", body).then((r) => r.data.post),
  deletePost: (id: string) => http.delete(`/api/posts/${id}`),
  duplicatePost: (id: string) => http.post<{ post: Post }>(`/api/posts/${id}/duplicate`).then((r) => r.data.post),
  schedulePost: (body: { postId: string; instagramAccountId?: string; scheduledAt: string; timezone: string; frequency: string }) =>
    http.post<{ schedule: Schedule }>("/api/schedules", body).then((r) => r.data.schedule),
  deleteSchedule: (id: string) => http.delete(`/api/schedules/${id}`),
  getAutopilot: () => http.get<{ autopilot: AutoPilot | null }>("/api/autopilot").then((r) => r.data.autopilot),
  saveAutopilot: (body: { instagramAccountId: string; niche: string; postsPerDay: number; postingTimes: string[]; timezone: string }) =>
    http.put<{ autopilot: AutoPilot }>("/api/autopilot", body).then((r) => r.data.autopilot),
  toggleAutopilot: () => http.patch<{ autopilot: AutoPilot }>("/api/autopilot/toggle").then((r) => r.data.autopilot),
  runAutopilot: (postingTimes: string[]) =>
    http.post<{ generated: number; posts: { postId: string; scheduledAt: string; title: string }[] }>("/api/autopilot/run", { postingTimes }).then((r) => r.data)
};
