import axios from "axios";
import { env } from "../config/env.js";
import { fallbackCropPrices } from "../utils/fallback-data.js";

const cropProfiles = [
  {
    crop: "Rice",
    seasons: ["kharif"],
    ideal: {
      temperature: [24, 34],
      humidity: [65, 90],
      soilMoisture: [55, 85]
    },
    irrigation: "Maintain standing water or frequent shallow irrigation. Keep soil consistently wet in vegetative phase.",
    waterNeed: "High",
    source: "https://icar.org.in/"
  },
  {
    crop: "Maize",
    seasons: ["kharif", "rabi"],
    ideal: {
      temperature: [20, 32],
      humidity: [50, 75],
      soilMoisture: [42, 65]
    },
    irrigation: "Irrigate at knee-high, tasseling, and grain-filling stages. Avoid waterlogging.",
    waterNeed: "Medium",
    source: "https://agricoop.nic.in/"
  },
  {
    crop: "Millets",
    seasons: ["kharif", "rabi", "summer"],
    ideal: {
      temperature: [22, 35],
      humidity: [40, 70],
      soilMoisture: [30, 55]
    },
    irrigation: "Use protective irrigation only during prolonged dry spells. Prefer deficit irrigation planning.",
    waterNeed: "Low",
    source: "https://millets.res.in/"
  },
  {
    crop: "Soybean",
    seasons: ["kharif"],
    ideal: {
      temperature: [21, 32],
      humidity: [55, 80],
      soilMoisture: [42, 68]
    },
    irrigation: "Maintain moderate soil moisture, especially during flowering and pod-filling.",
    waterNeed: "Medium",
    source: "https://icar.org.in/"
  },
  {
    crop: "Wheat",
    seasons: ["rabi"],
    ideal: {
      temperature: [12, 27],
      humidity: [45, 70],
      soilMoisture: [38, 62]
    },
    irrigation: "Irrigate at crown root initiation, tillering, flowering, and milking stages.",
    waterNeed: "Medium",
    source: "https://iiwbr.icar.gov.in/"
  },
  {
    crop: "Chickpea",
    seasons: ["rabi"],
    ideal: {
      temperature: [15, 28],
      humidity: [40, 65],
      soilMoisture: [32, 55]
    },
    irrigation: "Limit irrigation; one pre-flowering and one pod-filling irrigation is usually enough.",
    waterNeed: "Low",
    source: "https://icar.org.in/"
  },
  {
    crop: "Mustard",
    seasons: ["rabi"],
    ideal: {
      temperature: [10, 25],
      humidity: [40, 65],
      soilMoisture: [30, 52]
    },
    irrigation: "Provide light irrigation at branching and pod formation when moisture falls below threshold.",
    waterNeed: "Low",
    source: "https://icar.org.in/"
  },
  {
    crop: "Tomato",
    seasons: ["summer", "kharif", "rabi"],
    ideal: {
      temperature: [18, 32],
      humidity: [50, 75],
      soilMoisture: [45, 70]
    },
    irrigation: "Use drip irrigation in short pulses. Increase frequency in high heat periods.",
    waterNeed: "Medium",
    source: "https://iihr.res.in/"
  },
  {
    crop: "Groundnut",
    seasons: ["summer", "kharif"],
    ideal: {
      temperature: [20, 34],
      humidity: [45, 70],
      soilMoisture: [35, 58]
    },
    irrigation: "Irrigate at flowering and pegging; avoid excess irrigation during maturity.",
    waterNeed: "Medium",
    fieldSuitability: "Well-drained sandy loam to loamy fields with good sunlight exposure.",
    majorDistricts: ["Ahmednagar", "Satara", "Solapur", "Pune"],
    regionTags: ["maharashtra", "western india"],
    source: "https://icar-dgr.org.in/"
  },
  {
    crop: "Cotton",
    seasons: ["kharif"],
    ideal: {
      temperature: [21, 35],
      humidity: [45, 75],
      soilMoisture: [35, 62]
    },
    irrigation: "Schedule irrigation at squaring, flowering, and boll development; avoid standing water.",
    waterNeed: "Medium",
    fieldSuitability: "Deep black cotton soil (regur) with moderate drainage.",
    majorDistricts: ["Yavatmal", "Akola", "Amravati", "Wardha"],
    regionTags: ["maharashtra", "vidarbha", "marathwada"],
    source: "https://cotcorp.org.in/"
  },
  {
    crop: "Sugarcane",
    seasons: ["summer", "kharif"],
    ideal: {
      temperature: [20, 36],
      humidity: [55, 85],
      soilMoisture: [55, 88]
    },
    irrigation: "Maintain frequent moisture through drip/furrow cycles, especially in tillering and grand growth stages.",
    waterNeed: "High",
    fieldSuitability: "Deep fertile loam to clay loam fields with reliable irrigation infrastructure.",
    majorDistricts: ["Kolhapur", "Sangli", "Satara", "Pune", "Ahmednagar"],
    regionTags: ["maharashtra", "western maharashtra"],
    source: "https://sugarcane.dac.gov.in/"
  },
  {
    crop: "Pigeon Pea (Tur)",
    seasons: ["kharif"],
    ideal: {
      temperature: [20, 34],
      humidity: [45, 75],
      soilMoisture: [30, 52]
    },
    irrigation: "Mostly rainfed; provide protective irrigation at flowering/pod filling when dry spells persist.",
    waterNeed: "Low",
    fieldSuitability: "Medium to deep black soils and red loam fields with good drainage.",
    majorDistricts: ["Latur", "Nanded", "Parbhani", "Yavatmal"],
    regionTags: ["maharashtra", "marathwada", "vidarbha"],
    source: "https://icar.org.in/"
  },
  {
    crop: "Onion",
    seasons: ["kharif", "rabi", "summer"],
    ideal: {
      temperature: [13, 30],
      humidity: [45, 75],
      soilMoisture: [40, 65]
    },
    irrigation: "Use light but frequent irrigation in bulb formation, then taper before harvest for storage quality.",
    waterNeed: "Medium",
    fieldSuitability: "Friable loam fields with good organic matter and strong drainage.",
    majorDistricts: ["Nashik", "Ahmednagar", "Pune", "Dhule"],
    regionTags: ["maharashtra", "north maharashtra"],
    source: "https://nhrdf.org/"
  },
  {
    crop: "Grapes",
    seasons: ["rabi", "summer"],
    ideal: {
      temperature: [15, 35],
      humidity: [40, 70],
      soilMoisture: [38, 62]
    },
    irrigation: "Drip irrigation with regulated deficit strategy during ripening and canopy management stages.",
    waterNeed: "Medium",
    fieldSuitability: "Well-drained light to medium soils with trellis/vineyard infrastructure.",
    majorDistricts: ["Nashik", "Sangli", "Solapur", "Pune"],
    regionTags: ["maharashtra", "western maharashtra"],
    source: "https://nrcgrapes.icar.gov.in/"
  },
  {
    crop: "Pomegranate",
    seasons: ["kharif", "rabi", "summer"],
    ideal: {
      temperature: [18, 38],
      humidity: [35, 65],
      soilMoisture: [30, 55]
    },
    irrigation: "Use drip irrigation with stress scheduling and avoid sudden overwatering near fruit maturity.",
    waterNeed: "Low",
    fieldSuitability: "Light to medium well-drained soils in semi-arid fields.",
    majorDistricts: ["Solapur", "Ahmednagar", "Sangli", "Nashik"],
    regionTags: ["maharashtra", "semi-arid"],
    source: "https://nrcpomegranate.icar.gov.in/"
  }
];

const normalize = (value, [min, max]) => {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  const mid = (min + max) / 2;
  const halfBand = Math.max((max - min) / 2, 1);

  if (value >= min && value <= max) {
    // Keep full score near the center and gently reduce near ideal-range edges.
    const centerDistance = Math.abs(value - mid);
    const edgeFactor = centerDistance / halfBand;
    return clamp(1 - edgeFactor * 0.25, 0.75, 1);
  }

  if (value < min) {
    const spread = Math.max(halfBand, 5, min * 0.35);
    return clamp(0.75 - ((min - value) / spread) * 0.75, 0, 0.74);
  }

  const spread = Math.max(halfBand, 5, max * 0.35);
  return clamp(0.75 - ((value - max) / spread) * 0.75, 0, 0.74);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const irrigationReferences = {
  sourceReference: {
    label: "Source reference",
    url: "https://openweathermap.org/api"
  },
  deepDiveReference: {
    label: "Deep-dive",
    url: "https://openweathermap.org/forecast5"
  },
  officialSourceReference: {
    label: "Official source reference",
    url: "https://www.fao.org/land-water/water/water-management/irrigation-scheduling/en/"
  }
};

const getWaterPlan = (profile, effectiveSoilMoisture) => {
  const baseCycleByNeed = {
    High: 2,
    Medium: 4,
    Low: 6
  };

  const baseCycle = baseCycleByNeed[profile.waterNeed] || 4;
  const idealMid = (profile.ideal.soilMoisture[0] + profile.ideal.soilMoisture[1]) / 2;
  const deficit = idealMid - effectiveSoilMoisture;

  const intervalDays = clamp(Math.round(baseCycle - deficit / 12), 1, 10);
  const nextIrrigationInDays = intervalDays <= 1 ? 0 : clamp(Math.round(intervalDays / 2), 1, intervalDays);
  const sessionsIn14Days = clamp(Math.round(14 / intervalDays), 1, 14);

  const rhythm = intervalDays <= 2 ? "Fast hydration rhythm" : intervalDays <= 5 ? "Balanced hydration rhythm" : "Conservation hydration rhythm";

  return {
    intervalDays,
    nextIrrigationInDays,
    sessionsIn14Days,
    rhythm,
    report: `${profile.crop}: irrigate every ${intervalDays} day(s), next irrigation in ${nextIrrigationInDays} day(s), expected ${sessionsIn14Days} irrigation session(s) in the next 14 days.`
  };
};

const summarizeFit = (crop, score) => {
  if (score >= 85) {
    return `${crop} is strongly suitable for current field conditions.`;
  }

  if (score >= 70) {
    return `${crop} is suitable with careful water and heat management.`;
  }

  return `${crop} can be cultivated but needs close monitoring and adaptive irrigation.`;
};

export const getIrrigationRecommendation = (sensorFeed, weather = null) => {
  const latest = sensorFeed.at(-1) || {};

  const hasSensorTemperature = Number.isFinite(latest.temperature);
  const temperature = hasSensorTemperature ? latest.temperature : Number(weather?.current?.temperature ?? 30);
  const humidity = Number.isFinite(latest.humidity) ? latest.humidity : Number(weather?.current?.humidity ?? 55);
  const soilMoisture = Number.isFinite(latest.soilMoisture) ? latest.soilMoisture : 45;
  const rainChance = Number(weather?.current?.rainfallChance ?? 0);

  const soilDeficit = clamp(45 - soilMoisture, 0, 45);
  const heatLoad = clamp(temperature - 30, 0, 20);
  const dryAirLoad = clamp(55 - humidity, 0, 35);
  const rainRelief = clamp(rainChance / 2, 0, 25);
  const irrigationLoad = soilDeficit * 1.2 + heatLoad * 1.1 + dryAirLoad * 0.8 - rainRelief;

  if (irrigationLoad >= 35) {
    return {
      status: "Irrigate Now",
      recommendation:
        "High water stress detected from low soil moisture, warm temperature, and dry air. Run drip irrigation in the next cool window.",
      plan: {
        window: "Pre-sunrise (05:00-07:00)",
        durationMinutes: 35,
        nextCheckHours: 4,
        basis: "temperature + humidity + soil moisture"
      },
      factors: {
        temperature,
        humidity,
        soilMoisture,
        rainChance,
        temperatureSource: hasSensorTemperature ? "sensor" : "openweather"
      },
      references: irrigationReferences
    };
  }

  if (irrigationLoad >= 22) {
    return {
      status: "Prepare Today",
      recommendation:
        "Moderate water stress is building. Schedule a shorter irrigation cycle and monitor soil trend later today.",
      plan: {
        window: "Evening (18:00-20:00)",
        durationMinutes: 24,
        nextCheckHours: 6,
        basis: "temperature + humidity + soil moisture"
      },
      factors: {
        temperature,
        humidity,
        soilMoisture,
        rainChance,
        temperatureSource: hasSensorTemperature ? "sensor" : "openweather"
      },
      references: irrigationReferences
    };
  }

  if (irrigationLoad >= 12) {
    return {
      status: "Monitor",
      recommendation: "Current field condition is near target. Recheck after noon heat or sudden humidity drop.",
      plan: {
        window: "No immediate irrigation",
        durationMinutes: 0,
        nextCheckHours: 8,
        basis: "temperature + humidity + soil moisture"
      },
      factors: {
        temperature,
        humidity,
        soilMoisture,
        rainChance,
        temperatureSource: hasSensorTemperature ? "sensor" : "openweather"
      },
      references: irrigationReferences
    };
  }

  return {
    status: "Healthy",
    recommendation: "Moisture and climate load are in a stable zone. Continue regular monitoring cadence.",
    plan: {
      window: "No irrigation required",
      durationMinutes: 0,
      nextCheckHours: 12,
      basis: "temperature + humidity + soil moisture"
    },
    factors: {
      temperature,
      humidity,
      soilMoisture,
      rainChance,
      temperatureSource: hasSensorTemperature ? "sensor" : "openweather"
    },
    references: irrigationReferences
  };
};

export const getCropRecommendations = ({
  region = "Western India",
  season = "Kharif",
  sensorFeed = [],
  weather = null
} = {}) => {
  const latest = sensorFeed.at(-1) || {};
  // Keep crop survival scoring sensor-driven; weather is not used for scoring here.
  const effectiveTemperature = Number.isFinite(latest.temperature) ? latest.temperature : 30;
  const effectiveHumidity = Number.isFinite(latest.humidity) ? latest.humidity : 55;
  const effectiveSoilMoisture = Number.isFinite(latest.soilMoisture) ? latest.soilMoisture : 45;
  const normalizedSeason = (season || "kharif").toLowerCase();
  const normalizedRegion = (region || "").toLowerCase();
  const isMaharashtraRegion =
    normalizedRegion.includes("maharashtra") ||
    normalizedRegion.includes("vidarbha") ||
    normalizedRegion.includes("marathwada") ||
    normalizedRegion.includes("konkan") ||
    normalizedRegion.includes("western maharashtra") ||
    normalizedRegion.includes("north maharashtra");

  const candidates = cropProfiles.filter((profile) => profile.seasons.includes(normalizedSeason));

  const ranked = candidates
    .map((profile) => {
      const tempFit = normalize(effectiveTemperature, profile.ideal.temperature);
      const humidityFit = normalize(effectiveHumidity, profile.ideal.humidity);
      const soilFit = normalize(effectiveSoilMoisture, profile.ideal.soilMoisture);
      const baseConfidence = Math.round((tempFit * 0.35 + humidityFit * 0.25 + soilFit * 0.4) * 100);
      const hasMaharashtraTag = profile.regionTags?.includes("maharashtra");
      const regionalBoost = isMaharashtraRegion && hasMaharashtraTag ? 6 : 0;
      const confidence = clamp(Math.max(40, baseConfidence + regionalBoost), 40, 99);
      const waterPlan = getWaterPlan(profile, effectiveSoilMoisture);

      return {
        crop: profile.crop,
        confidence,
        survivalProbability: confidence,
        reason: summarizeFit(profile.crop, confidence),
        region,
        season,
        waterManagement: profile.irrigation,
        waterNeed: profile.waterNeed,
        irrigationIntervalDays: waterPlan.intervalDays,
        nextIrrigationInDays: waterPlan.nextIrrigationInDays,
        sessionsIn14Days: waterPlan.sessionsIn14Days,
        waterRhythm: waterPlan.rhythm,
        waterManagementReport: waterPlan.report,
        fieldSuitability: profile.fieldSuitability || "General field suitability",
        majorDistricts: profile.majorDistricts || [],
        sourceUrl: profile.source,
        sourceLabel: "Official agriculture source",
        computedFrom: "sensor-feed",
        sensorBasis: {
          temperature: Number(effectiveTemperature.toFixed(1)),
          humidity: Number(effectiveHumidity.toFixed(1)),
          soilMoisture: Number(effectiveSoilMoisture.toFixed(1))
        },
        dimensionFit: {
          temperature: Math.round(tempFit * 100),
          humidity: Math.round(humidityFit * 100),
          soilMoisture: Math.round(soilFit * 100)
        }
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return ranked;
};

function normalizePriceItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const crop = item.crop || item.commodity || item.cropName;
  const market = item.market || item.marketName || item.mandi || "Local Market";
  const price = Number(item.price ?? item.modal_price ?? item.modalPrice ?? item.rate);
  const change = Number(item.change ?? item.changePercent ?? item.delta ?? 0);
  const trend = item.trend || (Number.isFinite(change) && change < 0 ? "down" : "up");

  if (!crop || !Number.isFinite(price)) {
    return null;
  }

  return {
    crop: String(crop),
    market: String(market),
    price,
    change: Number.isFinite(change) ? change : 0,
    trend: trend === "down" ? "down" : "up",
    arrivalDate: item.arrival_date || item.arrivalDate || null,
    minPrice: Number(item.min_price ?? item.minPrice ?? item.price ?? price),
    maxPrice: Number(item.max_price ?? item.maxPrice ?? item.price ?? price)
  };
}

async function fetchExternalMarketPrices() {
  if (!env.MARKET_PRICE_API_URL) {
    return null;
  }

  try {
    const response = await axios.get(env.MARKET_PRICE_API_URL, {
      params: {
        "api-key": env.MARKET_PRICE_API_KEY,
        format: "json",
        limit: 100,
        "filters[state]": "Maharashtra"
      },
      timeout: 10000
    });

    const raw = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.records)
        ? response.data.records
      : Array.isArray(response.data?.prices)
        ? response.data.prices
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

    const normalized = raw
      .map(normalizePriceItem)
      .filter(Boolean)
      .filter((item, index, items) => items.findIndex((candidate) => candidate.crop === item.crop) === index)
      .slice(0, 12);
    return normalized.length ? normalized : null;
  } catch (error) {
    console.warn("Market price API fetch failed, using fallback data", error.message);
    return null;
  }
}

export const getCropPriceTrends = async () => {
  const external = await fetchExternalMarketPrices();
  return external || fallbackCropPrices;
};
