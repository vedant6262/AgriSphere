import axios from "axios";
import { env } from "../config/env.js";
import { fallbackWeather } from "../utils/fallback-data.js";

const resolveOpenWeatherApiKey = () => {
  const raw = String(env.OPENWEATHER_API_KEY || "").trim();

  if (!raw) {
    return "";
  }

  if (raw.includes("appid=")) {
    try {
      const url = new URL(raw);
      return url.searchParams.get("appid") || "";
    } catch {
      const directMatch = raw.match(/appid=([^&]+)/i);
      return directMatch?.[1] || "";
    }
  }

  return raw;
};

const toKmh = (valueMs) => Math.round(Number(valueMs || 0) * 3.6);

const localDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapFiveDayForecast = (entries = []) => {
  const byDate = new Map();

  for (const entry of entries) {
    const date = new Date(entry.dt * 1000);
    const key = localDateKey(date);

    if (!byDate.has(key)) {
      byDate.set(key, []);
    }

    byDate.get(key).push(entry);
  }

  return [...byDate.values()].slice(0, 7).map((dayEntries) => {
    const targetHour = 12;
    const representative = dayEntries.reduce((best, current) => {
      const bestHour = new Date(best.dt * 1000).getHours();
      const currentHour = new Date(current.dt * 1000).getHours();
      return Math.abs(currentHour - targetHour) < Math.abs(bestHour - targetHour) ? current : best;
    }, dayEntries[0]);

    const dayLabel = new Date(representative.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

    return {
      day: dayLabel,
      temperature: Math.round(representative.main?.temp ?? 0),
      rainfall: Math.round((representative.pop ?? 0) * 100),
      humidity: representative.main?.humidity ?? 0,
      windSpeed: toKmh(representative.wind?.speed),
      summary: representative.weather?.[0]?.description || "forecast"
    };
  });
};

const mapOneCallDailyForecast = (daily = []) => {
  return daily.slice(0, 7).map((entry) => {
    const date = new Date(entry.dt * 1000);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      temperature: Math.round(entry.temp?.day ?? entry.temp?.max ?? 0),
      rainfall: Math.round((entry.pop ?? 0) * 100),
      humidity: Math.round(entry.humidity ?? 0),
      windSpeed: toKmh(entry.wind_speed),
      summary: entry.weather?.[0]?.description || "forecast"
    };
  });
};

export const getWeatherForecast = async (settings) => {
  const openWeatherApiKey = resolveOpenWeatherApiKey();

  if (!openWeatherApiKey || settings?.latitude == null || settings?.longitude == null) {
    return fallbackWeather;
  }

  try {
    try {
      const oneCallResponse = await axios.get("https://api.openweathermap.org/data/3.0/onecall", {
        params: {
          lat: settings.latitude,
          lon: settings.longitude,
          appid: openWeatherApiKey,
          units: "metric",
          exclude: "minutely,hourly,alerts"
        },
        timeout: 10000
      });

      const current = oneCallResponse.data?.current;
      const daily = oneCallResponse.data?.daily || [];
      const forecast = mapOneCallDailyForecast(daily);

      if (current && forecast.length) {
        return {
          location: settings.location,
          current: {
            temperature: Math.round(current.temp ?? fallbackWeather.current.temperature),
            humidity: Math.round(current.humidity ?? fallbackWeather.current.humidity),
            windSpeed: toKmh(current.wind_speed ?? 0) || fallbackWeather.current.windSpeed,
            rainfallChance: Math.round((daily[0]?.pop ?? 0) * 100),
            summary: current.weather?.[0]?.description || fallbackWeather.current.summary
          },
          forecast
        };
      }
    } catch (oneCallError) {
      console.warn("OpenWeather One Call unavailable, using forecast endpoint", oneCallError.message);
    }

    const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        lat: settings.latitude,
        lon: settings.longitude,
        appid: openWeatherApiKey,
        units: "metric"
      },
      timeout: 10000
    });

    const entries = response.data?.list ?? [];
    const current = entries[0];
    const forecast = mapFiveDayForecast(entries);

    return {
      location: response.data?.city?.name || settings.location,
      current: {
        temperature: Math.round(current?.main?.temp ?? fallbackWeather.current.temperature),
        humidity: current?.main?.humidity ?? fallbackWeather.current.humidity,
        windSpeed: toKmh(current?.wind?.speed ?? 0) || fallbackWeather.current.windSpeed,
        rainfallChance: Math.round((current?.pop ?? 0) * 100),
        summary: current?.weather?.[0]?.description || fallbackWeather.current.summary
      },
      forecast: forecast.length ? forecast : fallbackWeather.forecast
    };
  } catch (error) {
    console.warn("OpenWeather fetch failed, using fallback data", error.message);
    return fallbackWeather;
  }
};
