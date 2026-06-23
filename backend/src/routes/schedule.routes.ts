import { Router } from "express";
import * as schedules from "../controllers/schedule.controller.js";
import { validate } from "../middleware/validate.js";
import { schedulePostSchema } from "../validators/post.validator.js";

export const scheduleRoutes = Router();

scheduleRoutes.get("/", schedules.listSchedules);
scheduleRoutes.post("/", validate(schedulePostSchema), schedules.createSchedule);
scheduleRoutes.patch("/:id", schedules.updateSchedule);
scheduleRoutes.delete("/:id", schedules.deleteSchedule);
