import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireUser, getSettings);
router.put("/", requireUser, updateSettings);

export default router;
