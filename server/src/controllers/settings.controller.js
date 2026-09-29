import { z } from "zod";
import { getFarmSettings, upsertFarmSettings } from "../services/settings.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const settingsSchema = z.object({
  farmName: z.string().optional(),
  farmerName: z.string().optional(),
  location: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  cropType: z.string().optional(),
  region: z.string().optional(),
  season: z.string().optional(),
  farmSizeAcres: z.coerce.number().optional(),
  irrigationMethod: z.string().optional(),
  preferredLanguage: z.string().optional(),
  phoneNumber: z.string().optional(),
  soilType: z.string().optional(),
  useCurrentLocation: z.boolean().optional(),
  tempLowThreshold: z.coerce.number().optional(),
  tempHighThreshold: z.coerce.number().optional(),
  sensorChannelId: z.string().optional(),
  sensorFieldSoil: z.coerce.number().optional(),
  sensorFieldHum: z.coerce.number().optional(),
  sensorFieldTemp: z.coerce.number().optional()
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  res.json({ settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid settings payload.",
      details: parsed.error.flatten()
    });
  }

  const settings = await upsertFarmSettings(req.userId, parsed.data);
  res.json({ settings });
});
