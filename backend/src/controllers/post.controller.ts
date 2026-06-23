import type { Request, Response } from "express";
import { geminiService } from "../ai/gemini.service.js";
import { imageService } from "../ai/image.service.js";
import { Post } from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await geminiService.generateContent(req.body.niche, req.body.trend);
  res.json({ content });
});

export const generateImages = asyncHandler(async (req: Request, res: Response) => {
  const images = await imageService.generate(req.body.prompt, req.body.provider, req.body.count, req.body.overlayTitle, req.body.overlayHook);
  res.json({ images });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.create({ ...req.body, userId: req.user!.id });
  res.status(201).json({ post });
});

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find({ userId: req.user!.id }).sort({ createdAt: -1 });
  res.json({ posts });
});

export const duplicatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
  if (!post) return res.status(404).json({ message: "Post not found" });
  const copy = await Post.create({ ...post, _id: undefined, title: `${post.title} Copy`, status: "pending" });
  res.status(201).json({ post: copy });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await Post.deleteOne({ _id: req.params.id, userId: req.user!.id });
  res.status(204).send();
});
