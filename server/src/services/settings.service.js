import { getPrisma } from "../lib/prisma.js";
import { fallbackSettings } from "../utils/fallback-data.js";

export const getFarmSettings = async (clerkUserId) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return { id: "demo-settings", clerkUserId, ...fallbackSettings };
  }

  try {
    const existing = await prisma.farmProfile.findUnique({
      where: { clerkUserId }
    });

    if (existing) {
      return existing;
    }

    return prisma.farmProfile.create({
      data: {
        clerkUserId,
        ...fallbackSettings
      }
    });
  } catch (error) {
    console.warn("[settings] prisma error, using fallback", error.message);
    return { id: "demo-settings", clerkUserId, ...fallbackSettings };
  }
};

export const upsertFarmSettings = async (clerkUserId, data) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return { id: "demo-settings", clerkUserId, ...fallbackSettings, ...data };
  }

  try {
    return prisma.farmProfile.upsert({
      where: { clerkUserId },
      update: data,
      create: {
        clerkUserId,
        ...fallbackSettings,
        ...data
      }
    });
  } catch (error) {
    console.warn("[settings] prisma error, using fallback", error.message);
    return { id: "demo-settings", clerkUserId, ...fallbackSettings, ...data };
  }
};
