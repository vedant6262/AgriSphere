import express from "express";
import { listGovernmentSchemes } from "../controllers/government-schemes.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireUser, listGovernmentSchemes);

export default router;
