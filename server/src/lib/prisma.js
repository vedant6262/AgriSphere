import { env } from "../config/env.js";

let prismaClient;

export const getPrisma = async () => {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!prismaClient) {
    const { PrismaClient } = await import("@prisma/client");
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL
        }
      }
    });
  }

  return prismaClient;
};
