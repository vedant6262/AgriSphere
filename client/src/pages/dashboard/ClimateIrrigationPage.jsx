import { CloudDrizzle, CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const weatherIcons = {
  rainy: CloudRain,
  cloudy: CloudDrizzle,
  sunny: ThermometerSun
};

export function ClimateIrrigationPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) return <div className="saas-card animate-pulse">Loading climate and irrigation command center...</div>;
  if (error || !data) return <DashboardCard title="Climate and irrigation unavailable" description={`Unable to load data: ${error}`} />;

  const latestSensor = data.sensorFeed.at(-1) || {};
  const currentTemp = Number.isFinite(latestSensor.temperature) ? latestSensor.temperature : data.weather.current.temperature;
  const currentHumidity = latestSensor.humidity ?? data.weather.current.humidity;
  const currentSoilMoisture = latestSensor.soilMoisture ?? 0;
  const currentRainChance = data.weather.current.rainfallChance;
  const tempSource = Number.isFinite(latestSensor.temperature) ? "Sensor" : "OpenWeather";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title mt-2">Unified weather intelligence and irrigation planning</h2>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Live Telemetry" description="Current field and weather readings.">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <dt className="card-label">Temperature</dt>
              <dd className="mt-1 text-3xl font-semibold text-rose-500">{currentTemp}°C</dd>
              <p className="mt-1 text-xs text-muted-foreground">Source: {tempSource}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <dt className="card-label">Humidity</dt>
              <dd className="mt-1 text-3xl font-semibold text-cyan-500">{currentHumidity}%</dd>
              <p className="mt-1 text-xs text-muted-foreground">Relative humidity</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <dt className="card-label">Soil Moisture</dt>
              <dd className="mt-1 text-3xl font-semibold text-emerald-500">{currentSoilMoisture}%</dd>
              <p className="mt-1 text-xs text-muted-foreground">Root-zone moisture</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <dt className="card-label">Rain Probability</dt>
              <dd className="mt-1 text-3xl font-semibold text-sky-500">{currentRainChance}%</dd>
              <p className="mt-1 text-xs text-muted-foreground">OpenWeather forecast</p>
            </div>
          </dl>
        </DashboardCard>

        <DashboardCard title="Irrigation Plan" description="Adaptive recommendation from current telemetry." className="monitor-report-card" action={<Badge>{data.irrigation.status}</Badge>}>
          <div className="rounded-2xl border border-border/70 bg-primary/10 p-4">
            <p className="font-display text-2xl font-semibold">{data.irrigation.status}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.irrigation.recommendation}</p>
          </div>

          {data.irrigation.plan ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
                <p className="card-label">Duration</p>
                <p className="mt-1 text-sm font-semibold">{data.irrigation.plan.durationMinutes} min</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
                <p className="card-label">Review In</p>
                <p className="mt-1 text-sm font-semibold">{data.irrigation.plan.nextCheckHours} hr</p>
              </div>
            </div>
          ) : null}
        </DashboardCard>
      </section>

      <DashboardCard title="Forecast Overview">
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-background/70">
          <table className="min-w-full text-sm" aria-label="Weather forecast table">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Day</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Temp</th>
                <th className="px-4 py-3 font-semibold">Humidity</th>
                <th className="px-4 py-3 font-semibold">Rain</th>
                <th className="px-4 py-3 font-semibold">Wind</th>
              </tr>
            </thead>
            <tbody>
              {data.weather.forecast.map((day) => {
                const Icon = weatherIcons[(day.summary || "").toLowerCase()] || CloudDrizzle;
                return (
                  <tr key={`forecast-row-${day.day}`} className="border-t border-border/60">
                    <td className="px-4 py-3 font-semibold">{day.day}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {day.summary || "Forecast"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{day.temperature}°C</td>
                    <td className="px-4 py-3">{day.humidity}%</td>
                    <td className="px-4 py-3">{day.rainfall}%</td>
                    <td className="px-4 py-3">{day.windSpeed} km/h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </DashboardCard>
    </div>
  );
}