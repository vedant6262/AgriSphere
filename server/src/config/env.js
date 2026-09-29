import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().optional(),
  NEON_DATABASE_URL: z.string().optional(),
  LOCAL_DATABASE_URL: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  OPENWEATHER_API_KEY: z.string().optional(),
  MARKET_PRICE_API_URL: z.string().optional(),
  MARKET_PRICE_API_KEY: z.string().optional(),
  PLANT_DISEASE_API_URL: z.string().default("https://my-api.plantnet.org/v2/identify/all"),
  PLANT_DISEASE_API_KEY: z.string().optional(),
  DISEASE_SEGMENTATION_API_URL: z.string().optional(),
  DISEASE_SEGMENTATION_API_KEY: z.string().optional(),
  ALLOW_DEMO_MODE: z.string().default("true")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const isProduction = parsed.data.NODE_ENV === "production";
const resolvedDatabaseUrl = isProduction
  ? parsed.data.NEON_DATABASE_URL || parsed.data.DATABASE_URL || parsed.data.LOCAL_DATABASE_URL
  : parsed.data.LOCAL_DATABASE_URL || parsed.data.DATABASE_URL || parsed.data.NEON_DATABASE_URL;

if (resolvedDatabaseUrl) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

export const env = {
  ...parsed.data,
  DATABASE_URL: resolvedDatabaseUrl,
  ALLOW_DEMO_MODE: parsed.data.ALLOW_DEMO_MODE === "true"
};
