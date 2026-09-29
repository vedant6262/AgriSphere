import { z } from "zod";
import { createTask, deleteTask, listTasks } from "../services/farm-calendar.service.js";
import { recordTaskAlert } from "../services/alerts.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const taskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(300).optional(),
  scheduledAt: z.string().datetime()
});

const toDemoTask = (payload) => ({
  id: `task-${Date.now()}`,
  title: payload.title,
  description: payload.description || null,
  scheduledAt: payload.scheduledAt,
  remindBeforeHours: payload.remindBeforeHours ?? 0,
  status: "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const getTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await listTasks(req.userId);
    res.json({ tasks });
  } catch (error) {
    console.warn("[farm-calendar] list tasks failed, using demo", error.message);
    res.json({ tasks: [] });
  }
});

export const postTask = asyncHandler(async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid calendar task payload.",
      details: parsed.error.flatten()
    });
  }

  try {
    const task = await createTask(req.userId, parsed.data);
    await recordTaskAlert(req.userId, task);
    res.status(201).json({ task });
  } catch (error) {
    console.warn("[farm-calendar] create task failed, using demo", error.message);
    const task = toDemoTask(parsed.data);
    await recordTaskAlert(req.userId, task);
    res.status(201).json({ task, demo: true });
  }
});

export const deleteTaskById = asyncHandler(async (req, res) => {
  try {
    const task = await deleteTask(req.userId, req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ deleted: true, task });
  } catch (error) {
    console.warn("[farm-calendar] delete task failed, using demo", error.message);
    res.json({ deleted: false, task: null });
  }
});
