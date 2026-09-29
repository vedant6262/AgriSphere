import express from "express";
import { acknowledge, getAlerts, streamAlerts } from "../controllers/alerts.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireUser, getAlerts);
router.get("/stream", requireUser, streamAlerts);
router.post("/:id/acknowledge", requireUser, acknowledge);

export default router;
