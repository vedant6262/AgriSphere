import { getGovernmentSchemes } from "../services/government-schemes.service.js";
import { getFarmSettings } from "../services/settings.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const listGovernmentSchemes = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  const schemes = getGovernmentSchemes(settings.region);
  res.json({ schemes });
});
