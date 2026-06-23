import { Router } from "express";
import * as posts from "../controllers/post.controller.js";
import { validate } from "../middleware/validate.js";
import { createPostSchema, generateContentSchema, imageGenerationSchema } from "../validators/post.validator.js";

export const postRoutes = Router();

postRoutes.get("/", posts.listPosts);
postRoutes.post("/", validate(createPostSchema), posts.createPost);
postRoutes.post("/generate-content", validate(generateContentSchema), posts.generateContent);
postRoutes.post("/generate-images", validate(imageGenerationSchema), posts.generateImages);
postRoutes.post("/:id/duplicate", posts.duplicatePost);
postRoutes.delete("/:id", posts.deletePost);
