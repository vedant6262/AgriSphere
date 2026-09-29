import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { ChartCard } from "@/components/saas/chart-card";
import { useTheme } from "@/context/theme-context";

const metricConfig = [
  {
    key: "soilMoisture",
    label: "Soil Moisture",
    unit: "%",
    stroke: "#10B981",
    fill: "rgba(16, 185, 129, 0.22)",
    min: 0,
    max: 100,
    tickStep: 20
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    stroke: "#06B6D4",
    fill: "rgba(6, 182, 212, 0.22)",
    min: 0,
    max: 100,
    tickStep: 20
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "C",
    stroke: "#FB7185",
    fill: "rgba(251, 113, 133, 0.22)",
    min: 0,
    max: 60,
    tickStep: 10
  }
];

function formatTrend(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return "No prior reading";
  }

  const delta = Number((current - previous).toFixed(1));
  if (delta === 0) {
    return "Stable";
  }

  const direction = delta > 0 ? "+" : "";
  return `${direction}${delta}`;
}

function getLastValues(sensorFeed, key) {
  const latest = Number(sensorFeed.at(-1)?.[key]);
  const previous = Number(sensorFeed.at(-2)?.[key]);

  return {
    latest: Number.isFinite(latest) ? Number(latest.toFixed(1)) : 0,
    previous: Number.isFinite(previous) ? Number(previous.toFixed(1)) : null
  };
}

export function SensorChart({ sensorFeed = [] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const labels = sensorFeed.map((entry) =>
    new Date(entry.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );

  const makeSeries = (label, values, borderColor, backgroundColor) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor,
        backgroundColor,
        pointRadius: (context) => (context.dataIndex === values.length - 1 ? 3 : 0),
        pointHoverRadius: 4,
        pointBackgroundColor: borderColor,
        tension: 0.45,
        fill: true
      }
    ]
  });

  const makeOptions = (metric) => ({
    maintainAspectRatio: false,
    animation: {
      duration: 640,
      easing: "easeOutQuart"
    },
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(17, 24, 39, 0.92)" : "rgba(255, 255, 255, 0.95)",
        borderColor: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(148, 163, 184, 0.24)",
        borderWidth: 1,
        titleColor: isDark ? "#E5E7EB" : "#111827",
        bodyColor: isDark ? "#D1D5DB" : "#374151"
      }
    },
    scales: {
      y: {
        min: metric.min,
        max: metric.max,
        ticks: {
          stepSize: metric.tickStep,
          color: isDark ? "#9CA3AF" : "#6B7280"
        },
        grid: {
          color: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.16)",
          borderDash: [3, 4]
        }
      },
      x: {
        ticks: {
          maxTicksLimit: 6,
          color: isDark ? "#9CA3AF" : "#6B7280"
        },
        grid: {
          display: false
        }
      }
    }
  });

  if (!sensorFeed.length) {
    return (
      <section className="dash-grid md:grid-cols-3">
        {metricConfig.map((metric) => (
          <ChartCard
            key={metric.key}
            title={`${metric.label} Live Trend`}
            description="Sensor feed auto-updates and reacts to field changes."
            className="monitor-chart-panel"
            contentClassName="h-[320px]"
          >
            <div className="flex h-full flex-col">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2">
                  <p className="card-label">Latest reading</p>
                  <p className="mt-1 font-display text-2xl font-semibold" style={{ color: metric.stroke }}>
                    0
                    <span className="ml-1 text-sm text-muted-foreground">{metric.unit}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-right">
                  <span className="sensor-live-indicator">Live</span>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">No prior reading</p>
                </div>
              </div>
              <div className="mt-3 flex-1 rounded-2xl border border-dashed border-border/70 bg-background/40 text-sm text-muted-foreground">
                <div className="flex h-full items-center justify-center">Waiting for sensor readings...</div>
              </div>
            </div>
          </ChartCard>
        ))}
      </section>
    );
  }

  return (
    <section className="dash-grid md:grid-cols-3">
      {metricConfig.map((metric) => {
        const values = sensorFeed.map((entry) => entry[metric.key]);
        const chartSeries = makeSeries(metric.label, values, metric.stroke, metric.fill);
        const lastValues = getLastValues(sensorFeed, metric.key);
        const trend = formatTrend(lastValues.latest, lastValues.previous);
        const trendText = trend === "Stable" || trend === "No prior reading" ? trend : `${trend} ${metric.unit}`;

        return (
          <ChartCard
            key={metric.key}
            title={`${metric.label} Live Trend`}
            description="Sensor feed auto-updates and reacts to field changes."
            className="monitor-chart-panel"
            contentClassName="h-[320px]"
          >
            <div className="flex h-full flex-col">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2">
                  <p className="card-label">Latest reading</p>
                  <p className="mt-1 font-display text-2xl font-semibold" style={{ color: metric.stroke }}>
                    {lastValues.latest}
                    <span className="ml-1 text-sm text-muted-foreground">{metric.unit}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-right">
                  <span className="sensor-live-indicator">Live</span>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{trendText}</p>
                </div>
              </div>
              <div className="mt-3 min-h-0 flex-1 rounded-2xl bg-background/20 p-1.5">
                <Line data={chartSeries} options={makeOptions(metric)} />
              </div>
            </div>
          </ChartCard>
        );
      })}
    </section>
  );
}
