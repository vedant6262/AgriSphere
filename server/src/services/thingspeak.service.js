import { fallbackSensors } from "../utils/fallback-data.js";
import { getWeatherForecast } from "./weather.service.js";

const deriveSoilMoisture = (humidity, rainfallChance) => {
  const estimated = 28 + humidity * 0.35 + rainfallChance * 0.2;
  return Math.max(18, Math.min(92, Math.round(estimated)));
};

export const getSensorFeed = async (settings) => {
  try {
    const weather = await getWeatherForecast(settings);
    const now = new Date();

    const feed = (weather.forecast || []).slice(0, 6).map((entry, index) => {
      const timestamp = new Date(now.getTime() - (5 - index) * 2 * 60 * 60 * 1000).toISOString();

      return {
        timestamp,
        soilMoisture: deriveSoilMoisture(entry.humidity, entry.rainfall),
        humidity: Number(entry.humidity ?? 0),
        temperature: Number(entry.temperature ?? 0)
      };
    });

    return feed.length ? feed : fallbackSensors;
  } catch (error) {
    console.warn("Climate feed generation failed, using fallback data", error.message);
    return fallbackSensors;
  }
};
