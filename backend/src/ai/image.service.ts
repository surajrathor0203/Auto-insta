import axios from "axios";
import sharp from "sharp";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { cloudinaryService } from "../services/cloudinary.service.js";
import { geminiService } from "./gemini.service.js";

type Provider = "gemini" | "stable-diffusion" | "huggingface";

function xmlEscape(text: string): string {
  return text.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c] ?? c));
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export class ImageService {
  async generate(prompt: string, provider: Provider, count: number, overlayTitle?: string, overlayHook?: string) {
    const urls: string[] = [];
    for (let index = 0; index < count; index += 1) {
      let raw: string;
      if (provider === "stable-diffusion") {
        raw = await this.stableDiffusion(prompt);
      } else if (provider === "huggingface") {
        raw = await this.huggingFace(prompt);
      } else {
        raw = await geminiService.generateImage(prompt);
      }
      if (overlayTitle) {
        raw = await this.addTextOverlay(raw, overlayTitle, overlayHook ?? "");
      }
      urls.push(await cloudinaryService.uploadDataUri(raw));
    }
    return urls;
  }

  private async addTextOverlay(dataUri: string, title: string, hook: string): Promise<string> {
    const base64Data = dataUri.replace(/^data:[^;]+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const meta = await sharp(imageBuffer).metadata();
    const w = meta.width ?? 1080;
    const h = meta.height ?? 1080;

    const overlayH = Math.round(h * 0.28);
    const titleSize = Math.round(h * 0.048);
    const hookSize = Math.round(h * 0.028);
    const pad = Math.round(w * 0.05);

    const titleLines = wrapText(xmlEscape(title.slice(0, 100)), 30);
    const hookLines = hook ? wrapText(xmlEscape(hook.slice(0, 140)), 48) : [];

    const lineHeight = titleSize * 1.3;
    const hookLineHeight = hookSize * 1.35;

    let titleY = h - overlayH + Math.round(overlayH * 0.18);
    const titleSvg = titleLines.map((line) => {
      const y = titleY;
      titleY += lineHeight;
      return `<text x="${pad}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-size="${titleSize}" font-weight="900" fill="white" filter="url(#shadow)">${line}</text>`;
    }).join("\n");

    let hookY = titleY + hookSize * 0.5;
    const hookSvg = hookLines.map((line) => {
      const y = hookY;
      hookY += hookLineHeight;
      return `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="${hookSize}" fill="rgba(255,255,255,0.9)" filter="url(#shadow)">${line}</text>`;
    }).join("\n");

    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.78"/>
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="1" dy="1" stdDeviation="3" flood-color="black" flood-opacity="0.8"/>
        </filter>
      </defs>
      <rect x="0" y="${h - overlayH}" width="${w}" height="${overlayH}" fill="url(#grad)"/>
      ${titleSvg}
      ${hookSvg}
    </svg>`;

    const processed = await sharp(imageBuffer)
      .composite([{ input: Buffer.from(svg), blend: "over" }])
      .jpeg({ quality: 92 })
      .toBuffer();

    return `data:image/jpeg;base64,${processed.toString("base64")}`;
  }

  private async stableDiffusion(prompt: string) {
    if (!env.STABLE_DIFFUSION_API_URL) return `https://placehold.co/1080x1080/111827/f8fafc?text=${encodeURIComponent(prompt.slice(0, 40))}`;
    const { data } = await axios.post(
      env.STABLE_DIFFUSION_API_URL,
      { prompt, width: 1080, height: 1080 },
      { headers: { Authorization: `Bearer ${env.STABLE_DIFFUSION_API_KEY}` } }
    );
    return data.image ?? data.output?.[0];
  }

  private async huggingFace(prompt: string) {
    if (!env.HUGGINGFACE_API_KEY) {
      return `https://placehold.co/1080x1080/111827/f8fafc?text=${encodeURIComponent(prompt.slice(0, 40))}`;
    }
    try {
      const safePrompt = prompt.slice(0, 500);
      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        { inputs: safePrompt },
        {
          headers: {
            Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "image/jpeg"
          },
          responseType: "arraybuffer",
          timeout: 120_000
        }
      );
      const contentType = (response.headers["content-type"] as string) || "image/jpeg";
      const base64 = Buffer.from(response.data as ArrayBuffer).toString("base64");
      return `data:${contentType};base64,${base64}`;
    } catch (error: any) {
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        throw new ApiError(503, "Cannot reach Hugging Face servers. Check your internet connection, then try again.");
      }
      if (error.response) {
        const status = error.response.status;
        let detail = "";
        try {
          detail = Buffer.from(error.response.data as ArrayBuffer).toString("utf8");
          const parsed = JSON.parse(detail);
          detail = parsed.error ?? parsed.message ?? detail;
        } catch { /* leave as raw string */ }
        if (status === 503) throw new ApiError(503, "Hugging Face model is loading — takes ~20 seconds on first use. Try again in a moment.");
        if (status === 401 || status === 403) throw new ApiError(401, "Invalid Hugging Face API key. Check HUGGINGFACE_API_KEY in backend/.env.");
        if (status === 429) throw new ApiError(429, "Hugging Face rate limit reached. Wait a moment and try again.");
        throw new ApiError(502, `Hugging Face API error ${status}${detail ? `: ${detail}` : ""}`);
      }
      throw error;
    }
  }
}

export const imageService = new ImageService();
