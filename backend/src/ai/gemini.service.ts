import axios, { type AxiosError } from "axios";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

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

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeGeneratedContent(value: Partial<GeneratedContent>, niche: string, trend: string): GeneratedContent {
  return {
    title: value.title?.trim() || `${trend} for ${niche}`,
    caption: value.caption?.trim() || `A practical look at ${trend} and what it means for ${niche}.`,
    hashtags: toStringArray(value.hashtags),
    carouselContent: toStringArray(value.carouselContent),
    seoKeywords: toStringArray(value.seoKeywords),
    engagementHook: value.engagementHook?.trim() || `Everyone is talking about ${trend}. Here is the useful part.`,
    cta: value.cta?.trim() || "Save this for your next content planning session.",
    imagePrompt: value.imagePrompt?.trim() || `Professional Instagram marketing visual about ${trend} for ${niche}. Clean composition, bold colors, modern minimalist style, no text, cinematic lighting, highly detailed.`
  };
}

export class GeminiService {
  async generateContent(niche: string, trend: string): Promise<GeneratedContent> {
    if (!env.GEMINI_API_KEY) {
      return {
        title: `${trend} for ${niche}`,
        caption: `A practical look at ${trend} and what it means for ${niche}.`,
        hashtags: ["#instagram", "#marketing", `#${niche.replace(/\s+/g, "")}`],
        carouselContent: ["What is changing", "Why it matters", "How to act today"],
        seoKeywords: [trend, niche, "social media"],
        engagementHook: `Everyone is talking about ${trend}. Here is the useful part.`,
        cta: "Save this for your next content planning session.",
        imagePrompt: `Professional Instagram marketing visual about ${trend} for ${niche}. Clean composition, bold colors, modern minimalist style, no text, cinematic lighting.`
      };
    }

    const prompt = `You are an expert Instagram content strategist. Generate complete Instagram marketing content for the given audience and trend. Return ONLY a strict JSON object — no markdown, no explanation, just the JSON.

Required JSON fields:
- title: Punchy headline, max 10 words, no hashtags
- caption: Full Instagram caption, 150-250 words, conversational and engaging
- hashtags: Array of 12-15 hashtags as strings (include the # symbol)
- engagementHook: One powerful opening sentence that stops the scroll
- cta: Clear call-to-action for the post
- carouselContent: Array of 4-5 short slide texts for a carousel post (each max 12 words)
- seoKeywords: Array of 6-8 SEO keywords (no # symbol)
- imagePrompt: A detailed prompt for an AI image generator (FLUX model). Describe a SPECIFIC visual scene that powerfully communicates this topic to the audience. Rules: NO text in the scene, photorealistic or cinematic style, specific composition details, specific color palette, professional Instagram aesthetic, emotionally resonant. The scene must make the viewer instantly understand the topic without needing to read anything.

Audience niche: ${niche}
Trend: ${trend}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_TEXT_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    try {
      const { data } = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const json = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      return normalizeGeneratedContent(JSON.parse(json) as Partial<GeneratedContent>, niche, trend);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.error?.message;
        if (status === 429) throw new ApiError(429, `Gemini rate limit reached. Wait a minute and try again. (${message ?? "quota exceeded"})`);
        if (status === 401 || status === 403) throw new ApiError(401, `Invalid Gemini API key. Check GEMINI_API_KEY in backend/.env. (${message ?? "unauthorized"})`);
        if (status === 404) throw new ApiError(502, `Gemini model "${env.GEMINI_TEXT_MODEL}" not found. Check GEMINI_TEXT_MODEL in backend/.env.`);
        throw new ApiError(502, `Gemini API error ${status}: ${message ?? "unknown error"}`);
      }
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const placeholder = `https://placehold.co/1080x1080/101828/f9fafb?text=${encodeURIComponent(prompt.slice(0, 40))}`;
    if (!env.GEMINI_API_KEY) return placeholder;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_IMAGE_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
    try {
      const { data } = await axios.post(url, {
        contents: [{ parts: [{ text: `Create a premium Instagram marketing visual: ${prompt}` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      });
      const part = data.candidates?.[0]?.content?.parts?.find((item: any) => item.inlineData);
      if (!part?.inlineData) return placeholder;
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.error?.message;
        if (status === 429) throw new ApiError(429, `Gemini image rate limit reached. Wait a minute and try again. (${message ?? "quota exceeded"})`);
        if (status === 401 || status === 403) throw new ApiError(401, `Invalid Gemini API key. Check GEMINI_API_KEY in backend/.env.`);
        if (status === 404) throw new ApiError(502, `Gemini image model "${env.GEMINI_IMAGE_MODEL}" not found.`);
        throw new ApiError(502, `Gemini image API error ${status}: ${message ?? "unknown error"}`);
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
