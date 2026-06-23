import { Router } from "express";
import * as autopilot from "../controllers/autopilot.controller.js";

export const autopilotRoutes = Router();

autopilotRoutes.get("/", autopilot.getAutopilot);
autopilotRoutes.put("/", autopilot.saveAutopilot);
autopilotRoutes.patch("/toggle", autopilot.toggleAutopilot);
autopilotRoutes.post("/run", autopilot.triggerAutopilot);
