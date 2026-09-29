import { SENSOR_EMPTY_READING } from "@/components/monitoring/sensor-monitor.constants";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function toFinite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeSensorReading(payload = {}) {
  return {
    timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
    soilMoisture: clamp(toFinite(payload.soilMoisture, SENSOR_EMPTY_READING.soilMoisture), 0, 100),
    humidity: clamp(toFinite(payload.humidity, SENSOR_EMPTY_READING.humidity), 0, 100),
    temperature: clamp(toFinite(payload.temperature, SENSOR_EMPTY_READING.temperature), -10, 60)
  };
}

export function parseSerialLine(line = "") {
  const text = String(line).trim();
  if (!text) {
    return null;
  }

  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      return normalizeSensorReading(JSON.parse(text));
    } catch {
      return null;
    }
  }

  const pairs = text
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((pair) => pair.split(/[:=]/).map((piece) => piece.trim()));

  if (!pairs.length) {
    return null;
  }

  const map = {};
  for (const [key, value] of pairs) {
    if (!key || value == null) continue;
    const k = key.toLowerCase();
    if (k.includes("soil")) map.soilMoisture = value;
    if (k.includes("humid")) map.humidity = value;
    if (k.includes("temp")) map.temperature = value;
  }

  if (map.soilMoisture == null && map.humidity == null && map.temperature == null) {
    return null;
  }

  return {
    ...normalizeSensorReading(map),
    serialFields: Object.keys(map)
  };
}