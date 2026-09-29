import { listAlerts } from "../services/alerts.service.js";
import { analyzeCropDisease } from "../services/disease.service.js";
import { analyzeDiseaseRiskMap } from "../services/disease-risk.service.js";
import { getGovernmentSchemes } from "../services/government-schemes.service.js";
import { generateAgricultureReply } from "../services/openai.service.js";
import { getCropPriceTrends, getCropRecommendations, getIrrigationRecommendation } from "../services/recommendations.service.js";
import { getFarmSettings } from "../services/settings.service.js";
import { getSensorFeed } from "../services/thingspeak.service.js";
import { getWeatherForecast } from "../services/weather.service.js";
import { getTrainingVideos } from "../services/youtube.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  fallbackAlerts,
  fallbackCropPrices,
  fallbackSensors,
  fallbackSettings,
  fallbackVideos,
  fallbackWeather
} from "../utils/fallback-data.js";

const OVERVIEW_CACHE_TTL_MS = 15 * 1000;
const overviewCache = new Map();

const settledValue = (result, fallbackValue, label) => {
  if (result.status === "fulfilled") {
    return result.value;
  }

  console.warn(`[dashboard/overview] ${label} failed, using fallback`, result.reason?.message || result.reason);
  return fallbackValue;
};

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const cacheKey = req.userId || "anonymous";
  const cached = overviewCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.payload);
  }

  let settings;

  try {
    settings = await getFarmSettings(req.userId);
  } catch (error) {
    console.warn("[dashboard/overview] settings fetch failed, using fallback", error.message);
    settings = { id: "demo-settings", clerkUserId: req.userId, ...fallbackSettings };
  }

  const [sensorFeedResult, weatherResult, cropPricesResult, alertsResult, videosResult] = await Promise.allSettled([
    getSensorFeed(settings),
    getWeatherForecast(settings),
    getCropPriceTrends(),
    listAlerts(req.userId),
    getTrainingVideos(`${settings.cropType || "crop"} farming`)
  ]);

  const sensorFeed = settledValue(sensorFeedResult, fallbackSensors, "sensor feed");
  const weather = settledValue(weatherResult, fallbackWeather, "weather");
  const cropPrices = settledValue(cropPricesResult, fallbackCropPrices, "crop prices");
  const alerts = settledValue(alertsResult, fallbackAlerts, "alerts");
  const videos = settledValue(videosResult, fallbackVideos, "videos");

  const payload = {
    settings,
    sensorFeed,
    irrigation: getIrrigationRecommendation(sensorFeed, weather),
    weather,
    cropRecommendations: getCropRecommendations({
      region: settings.region,
      season: settings.season,
      sensorFeed,
      weather
    }),
    cropPrices,
    alerts,
    governmentSchemes: getGovernmentSchemes(settings.region),
    videos
  };

  overviewCache.set(cacheKey, {
    expiresAt: Date.now() + OVERVIEW_CACHE_TTL_MS,
    payload
  });

  res.json(payload);
});

export const getSensors = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  const [sensorFeed, weather] = await Promise.all([getSensorFeed(settings), getWeatherForecast(settings)]);

  res.json({
    sensorFeed,
    irrigation: getIrrigationRecommendation(sensorFeed, weather),
    weather
  });
});

export const getWeather = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  const weather = await getWeatherForecast(settings);
  res.json(weather);
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  const [sensorFeed, weather] = await Promise.all([
    getSensorFeed(settings),
    getWeatherForecast(settings)
  ]);

  res.json({
    recommendations: getCropRecommendations({
      region: settings.region,
      season: settings.season,
      sensorFeed,
      weather
    }),
    context: {
      temperature: sensorFeed.at(-1)?.temperature ?? weather.current.temperature,
      humidity: sensorFeed.at(-1)?.humidity ?? weather.current.humidity,
      soilMoisture: sensorFeed.at(-1)?.soilMoisture ?? null
    }
  });
});

export const getCropPrices = asyncHandler(async (_req, res) => {
  const prices = await getCropPriceTrends();
  res.json({ prices });
});

export const getVideos = asyncHandler(async (req, res) => {
  const query = req.query.query?.toString() || "climate smart farming";
  const videos = await getTrainingVideos(query);
  res.json({ videos });
});

export const postChatMessage = asyncHandler(async (req, res) => {
  const settings = await getFarmSettings(req.userId);
  const answer = await generateAgricultureReply(req.body.messages || [], settings);
  res.json({ answer });
});

export const postDiseaseAnalysis = asyncHandler(async (req, res) => {
  const result = await analyzeCropDisease(req.file);
  res.json(result);
});

export const postDiseaseRiskMap = asyncHandler(async (req, res) => {
  const result = await analyzeDiseaseRiskMap(req.file, req.userId);
  res.json(result);
});
