import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { SENSOR_METRICS } from "@/components/monitoring/sensor-monitor.constants";
import { useTheme } from "@/context/theme-context";

function makeOptions(isDark) {
  return {
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: { color: isDark ? "#9CA3AF" : "#6B7280" },
        grid: { color: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.16)" }
      },
      x: {
        ticks: { color: isDark ? "#9CA3AF" : "#6B7280" },
        grid: { display: false }
      }
    }
  };
}

function makeSeries(feed, metric) {
  const labels = feed.map((entry) => new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const values = feed.map((entry) => Number(entry[metric.key] ?? 0));

  return {
    labels,
    datasets: [
      {
        label: metric.label,
        data: values,
        borderColor: metric.color,
        backgroundColor: metric.fill,
        pointRadius: (context) => (context.dataIndex === values.length - 1 ? 3 : 0),
        pointBackgroundColor: metric.color,
        tension: 0.42,
        fill: true
      }
    ]
  };
}

export function SensorMonitorCharts({ feed }) {
  const { theme } = useTheme();
  const options = makeOptions(theme === "dark");

  return (
    <section className="dash-grid md:grid-cols-3">
      {SENSOR_METRICS.map((metric) => (
        <DashboardCard
          key={metric.key}
          title={`${metric.label} Trend`}
          description="Changes with each new sensor reading"
          className="monitor-chart-panel"
        >
          <div className="h-[250px]">
            <Line data={makeSeries(feed, metric)} options={options} />
          </div>
        </DashboardCard>
      ))}
    </section>
  );
}