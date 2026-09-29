export const SENSOR_METRICS = [
  {
    key: "soilMoisture",
    label: "Soil Moisture",
    unit: "%",
    color: "#10B981",
    fill: "rgba(16, 185, 129, 0.2)",
    max: 100
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    color: "#06B6D4",
    fill: "rgba(6, 182, 212, 0.2)",
    max: 100
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "C",
    color: "#FB7185",
    fill: "rgba(251, 113, 133, 0.2)",
    max: 60
  }
];

export const SENSOR_EMPTY_READING = {
  timestamp: new Date().toISOString(),
  soilMoisture: 0,
  humidity: 0,
  temperature: 0
};