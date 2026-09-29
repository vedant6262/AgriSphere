import { getPrisma } from "../lib/prisma.js";
import { getFarmSettings } from "./settings.service.js";

const demoTasksByUser = new Map();

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

export const listTasks = async (clerkUserId) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return demoTasksByUser.get(clerkUserId) || [];
  }

  try {
    const profile = await getFarmSettings(clerkUserId);

    return prisma.farmTask.findMany({
      where: { farmProfileId: profile.id },
      orderBy: { scheduledAt: "asc" }
    });
  } catch (error) {
    console.warn("[farm-calendar] prisma error, using demo tasks", error.message);
    return demoTasksByUser.get(clerkUserId) || [];
  }
};

export const createTask = async (clerkUserId, payload) => {
  const prisma = await getPrisma();

  if (!prisma) {
    const existing = demoTasksByUser.get(clerkUserId) || [];
    const task = toDemoTask(payload);
    demoTasksByUser.set(clerkUserId, [...existing, task]);
    return task;
  }

  try {
    const profile = await getFarmSettings(clerkUserId);

    return prisma.farmTask.create({
      data: {
        farmProfileId: profile.id,
        title: payload.title,
        description: payload.description,
        scheduledAt: new Date(payload.scheduledAt),
        remindBeforeHours: payload.remindBeforeHours ?? 0,
        status: "PENDING"
      }
    });
  } catch (error) {
    console.warn("[farm-calendar] prisma error, using demo tasks", error.message);
    const existing = demoTasksByUser.get(clerkUserId) || [];
    const task = toDemoTask(payload);
    demoTasksByUser.set(clerkUserId, [...existing, task]);
    return task;
  }
};

export const deleteTask = async (clerkUserId, taskId) => {
  const prisma = await getPrisma();

  if (!prisma) {
    const existing = demoTasksByUser.get(clerkUserId) || [];
    const target = existing.find((task) => task.id === taskId) || null;
    const updated = existing.filter((task) => task.id !== taskId);
    demoTasksByUser.set(clerkUserId, updated);
    return target;
  }

  try {
    const profile = await getFarmSettings(clerkUserId);

    const task = await prisma.farmTask.findFirst({
      where: {
        id: taskId,
        farmProfileId: profile.id
      }
    });

    if (!task) {
      return null;
    }

    return prisma.farmTask.delete({
      where: { id: taskId }
    });
  } catch (error) {
    console.warn("[farm-calendar] prisma error, using demo tasks", error.message);
    const existing = demoTasksByUser.get(clerkUserId) || [];
    const target = existing.find((task) => task.id === taskId) || null;
    const updated = existing.filter((task) => task.id !== taskId);
    demoTasksByUser.set(clerkUserId, updated);
    return target;
  }
};
