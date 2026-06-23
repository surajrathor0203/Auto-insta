import { Router } from "express";
import * as instagram from "../controllers/instagram.controller.js";

export const instagramRoutes = Router();

instagramRoutes.get("/", instagram.listAccounts);
instagramRoutes.get("/oauth/start", instagram.oauthStart);
instagramRoutes.get("/oauth/callback", instagram.oauthCallback);
instagramRoutes.delete("/:id", instagram.disconnectAccount);
