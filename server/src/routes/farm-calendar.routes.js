import express from "express";
import { deleteTaskById, getTasks, postTask } from "../controllers/farm-calendar.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/tasks", requireUser, getTasks);
router.post("/tasks", requireUser, postTask);
router.delete("/tasks/:id", requireUser, deleteTaskById);

export default router;
