import { Droplets, Sprout, ThermometerSun } from "lucide-react";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function CropRecommendationPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken, {
    refreshIntervalMs: 10000,
    updateOnSensorChange: true
  });
  if (isLoading) return <div className="saas-card animate-pulse">Loading crop recommendations...</div>;
  if (error || !data) {
    return <DashboardCard title="Crop recommendation unavailable" description={`Unable to load data: ${error}`} />;
  }

  const orderedRecommendations = [...(data.cropRecommendations || [])].sort((a, b) => {
    const aScore = Number(a.survivalProbability ?? a.confidence ?? 0);
    const bScore = Number(b.survivalProbability ?? b.confidence ?? 0);
    const aHighPriority = aScore >= 75 ? 1 : 0;
    const bHighPriority = bScore >= 75 ? 1 : 0;

    if (aHighPriority !== bHighPriority) {
      return bHighPriority - aHighPriority;
    }

    return bScore - aScore;
  });

  const latestSensor = data?.sensorFeed?.at(-1) || {};
  const sensorContext = {
    temperature: latestSensor.temperature ?? data?.weather?.current?.temperature ?? null,
    humidity: latestSensor.humidity ?? data?.weather?.current?.humidity ?? null,
    soilMoisture: latestSensor.soilMoisture ?? null
  };


  const topRecommendation = orderedRecommendations[0];
  const topScore = topRecommendation ? Number(topRecommendation.survivalProbability ?? topRecommendation.confidence ?? 0) : null;

  return (
    <div className="space-y-6">
      <DashboardCard
        label="Sensor-driven"
        title="Crop Recommendation"
        description="Live sensor context and crop fit forecasts based on your latest field readings."
        className="relative overflow-hidden bg-gradient-to-br from-emerald-50/70 via-white/80 to-lime-50/70"
      >
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <ThermometerSun className="h-5 w-5" />
                </span>
                <div>
                  <p className="card-label">Temperature</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {sensorContext.temperature ?? "N/A"}
                    {sensorContext.temperature !== null ? "°C" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
                  <Droplets className="h-5 w-5" />
                </span>
                <div>
                  <p className="card-label">Humidity</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {sensorContext.humidity ?? "N/A"}
                    {sensorContext.humidity !== null ? "%" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Sprout className="h-5 w-5" />
                </span>
                <div>
                  <p className="card-label">Soil moisture</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {sensorContext.soilMoisture ?? "N/A"}
                    {sensorContext.soilMoisture !== null ? "%" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {topRecommendation ? (
            <div className="rounded-3xl border border-primary/15 bg-white/70 p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="card-label text-primary">Best fit right now</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{topRecommendation.crop}</p>
                </div>
                <Badge variant="secondary" className="text-base">
                  {topRecommendation.survivalProbability ?? topRecommendation.confidence}%
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{topRecommendation.reason}</p>
              <div className="mt-4 h-2 rounded-full bg-muted/70">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${topScore ?? 0}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Top match for current season and sensor conditions.</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
              No crop recommendations available yet. Check sensor connectivity and data sync.
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard title="Recommended Crops" description="Suggestions generated from soil moisture, humidity, temperature, season, and region.">
        <div className="grid gap-4 lg:grid-cols-2">
          {orderedRecommendations.map((item) => {
            const score = Number(item.survivalProbability ?? item.confidence ?? 0);

            return (
              <div key={item.crop} className="rounded-2xl border border-border bg-background/60 p-4 transition hover:-translate-y-1 hover:bg-background/80">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-2xl font-semibold">{item.crop}</p>
                  <Badge variant="secondary">{score}% survival</Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted/70">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.reason}</p>
                {item.sensorBasis && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Sensor data used:</span>{" "}
                    Temp {item.sensorBasis.temperature}°C, Humidity {item.sensorBasis.humidity}%, Soil moisture {item.sensorBasis.soilMoisture}%
                  </p>
                )}
                {item.dimensionFit && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fit from sensor data: Temp {item.dimensionFit.temperature}%, Humidity {item.dimensionFit.humidity}%, Soil {item.dimensionFit.soilMoisture}%
                  </p>
                )}
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-foreground">Water need:</span> {item.waterNeed || "Medium"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Water management:</span>{" "}
                    {item.waterManagement || "Follow local irrigation schedule."}
                  </p>
                </div>
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
                    Deep Drive reference
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
}
