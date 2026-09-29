import { ArrowDownRight, ArrowUpRight, Minus, Droplets, Thermometer, Waves } from "lucide-react";

const metricConfig = [
  {
    key: "soilMoisture",
    label: "Soil Moisture",
    unit: "%",
    icon: Droplets,
    accent: "from-emerald-500 to-teal-500",
    ringColor: "rgba(16,185,129,0.9)"
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    icon: Waves,
    accent: "from-cyan-500 to-sky-500",
    ringColor: "rgba(6,182,212,0.92)"
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "C",
    icon: Thermometer,
    accent: "from-orange-500 to-rose-500",
    ringColor: "rgba(251,113,133,0.92)",
    max: 50
  }
];

const getMetricValue = (metric, latestSensor) => {
  const raw = Number(latestSensor?.[metric.key] ?? 0);
  if (!Number.isFinite(raw)) {
    return 0;
  }

  if (metric.key === "temperature") {
    return Math.max(0, Math.min(metric.max || 50, raw));
  }

  return Math.max(0, Math.min(100, raw));
};

const getDelta = (metric, latestSensor, previousSensor) => {
  const previous = Number(previousSensor?.[metric.key]);
  const current = Number(latestSensor?.[metric.key]);

  if (!Number.isFinite(previous) || !Number.isFinite(current)) {
    return null;
  }

  return Number((current - previous).toFixed(1));
};

const getStatusText = (metric, percent) => {
  if (metric.key === "temperature") {
    if (percent >= 76) return "Heat watch";
    if (percent >= 45) return "Optimal band";
    return "Cool trend";
  }

  if (percent >= 75) return "Healthy range";
  if (percent >= 45) return "Moderate range";
  return "Low range";
};

export function SensorGaugeGrid({ latestSensor, previousSensor = null }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metricConfig.map((metric) => {
        const Icon = metric.icon;
        const value = getMetricValue(metric, latestSensor);
        const max = metric.max || 100;
        const percent = Math.round((value / max) * 100);
        const delta = getDelta(metric, latestSensor, previousSensor);
        const TrendIcon = delta === null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
        const deltaLabel = delta === null ? "No prior reading" : delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta} ${metric.unit}`;
        const statusText = getStatusText(metric, percent);
        const orbStyle = {
          background: `conic-gradient(from 180deg, rgba(255,255,255,0.2) 0deg, rgba(255,255,255,0.2) ${Math.max(
            0,
            360 - Math.round((percent / 100) * 360)
          )}deg, ${metric.ringColor} ${Math.max(0, 360 - Math.round((percent / 100) * 360))}deg, ${metric.ringColor} 360deg)`
        };

        return (
          <div key={metric.key} className="sensor-gauge-card rounded-3xl border border-border/80 bg-card/80 p-4 shadow-soft">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="card-label">{metric.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold">
                  {value}
                  <span className="ml-1 text-lg text-muted-foreground">{metric.unit}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{statusText}</p>
              </div>
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.accent} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-xs">
              <TrendIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{deltaLabel}</span>
            </div>

            <div className="sensor-gauge-track" style={{ "--gauge-percent": `${percent}%` }}>
              <div className={`sensor-gauge-fill bg-gradient-to-r ${metric.accent}`} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{percent}% of monitoring range</p>
              <div className="relative h-12 w-12 rounded-full p-[4px]" style={orbStyle}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-[11px] font-semibold text-foreground">{percent}%</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
