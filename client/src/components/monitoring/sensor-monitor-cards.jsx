import { ArrowDownRight, ArrowUpRight, Minus, Droplets, Thermometer, Waves } from "lucide-react";
import { SENSOR_METRICS } from "@/components/monitoring/sensor-monitor.constants";

const ICON_BY_KEY = {
  soilMoisture: Droplets,
  humidity: Waves,
  temperature: Thermometer
};

function getDelta(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return null;
  }
  return Number((current - previous).toFixed(1));
}

export function SensorMonitorCards({ latest, previous }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {SENSOR_METRICS.map((metric) => {
        const Icon = ICON_BY_KEY[metric.key] || Droplets;
        const current = Number(latest?.[metric.key] ?? 0);
        const previousValue = Number(previous?.[metric.key]);
        const delta = getDelta(current, previousValue);
        const TrendIcon = delta == null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
        const deltaLabel = delta == null ? "No previous" : delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta} ${metric.unit}`;

        return (
          <article key={metric.key} className="sensor-gauge-card rounded-3xl border border-border/80 bg-card/80 p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="card-label">{metric.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold" style={{ color: metric.color }}>
                  {Number.isFinite(current) ? current.toFixed(1) : "0.0"}
                  <span className="ml-1 text-base text-muted-foreground">{metric.unit}</span>
                </p>
              </div>
              <span className="sensor-live-indicator">Live</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              <TrendIcon className="h-3.5 w-3.5 text-primary" />
              <span>{deltaLabel}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}