import { z } from "zod";

export const generateContentSchema = z.object({
  body: z.object({
    niche: z.string().min(2).max(120),
    trend: z.string().min(2).max(500),
    trendId: z.string().optional()
  })
});

export const createPostSchema = z.object({
  body: z.object({
    instagramAccountId: z.string().optional(),
    trendId: z.string().optional(),
    title: z.string().min(2),
    caption: z.string().min(2),
    hashtags: z.array(z.string()).default([]),
    imageUrl: z.string().url().optional(),
    carouselImages: z.array(z.string().url()).default([]),
    seoKeywords: z.array(z.string()).default([]),
    engagementHook: z.string().optional(),
    cta: z.string().optional(),
    provider: z.enum(["gemini", "stable-diffusion", "huggingface"]).optional()
  })
});

export const schedulePostSchema = z.object({
  body: z.object({
    postId: z.string(),
    instagramAccountId: z.string().optional(),
    scheduledAt: z.string().datetime(),
    timezone: z.string().default("UTC"),
    frequency: z.enum(["once", "daily", "weekly", "monthly"]).default("once")
  })
});

export const imageGenerationSchema = z.object({
  body: z.object({
    prompt: z.string().min(5).max(1000),
    provider: z.enum(["gemini", "stable-diffusion", "huggingface"]).default("huggingface"),
    count: z.number().min(1).max(6).default(1),
    overlayTitle: z.string().max(80).optional(),
    overlayHook: z.string().max(120).optional()
  })
});
