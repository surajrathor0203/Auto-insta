import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
  async uploadDataUri(dataUri: string, folder = "ai-instagram-auto-publisher") {
    if (!env.CLOUDINARY_CLOUD_NAME) return dataUri;
    const result = await cloudinary.uploader.upload(dataUri, { folder, resource_type: "image" });
    return result.secure_url;
  }
}

export const cloudinaryService = new CloudinaryService();
