import { AlertTriangle, CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react";
import { PriceIntelligence } from "@/components/dashboard/price-intelligence";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function OverviewPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) {
    return (
      <div className="dash-grid md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`loading-card-${index}`} className="saas-card h-36 animate-pulse bg-muted/60" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <DashboardCard title="Dashboard unavailable" description={`Unable to load dashboard: ${error}`} />;
  }

  const sensorFeed = Array.isArray(data.sensorFeed) ? data.sensorFeed : [];
  const latestSensor = sensorFeed.at(-1) || {};
  const recommendations = Array.isArray(data.cropRecommendations) ? data.cropRecommendations.slice(0, 3) : [];
  const alerts = Array.isArray(data.alerts) ? data.alerts.slice(0, 4) : [];

  return (
    <div className="space-y-6 pb-6">
      <section className="dash-grid md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Soil Moisture" value={`${latestSensor?.soilMoisture ?? 0}%`} helper="Latest sensor reading" icon={Droplets} />
        <MetricCard label="Temperature" value={`${data.weather.current.temperature}°C`} helper={data.weather.current.summary} icon={ThermometerSun} />
        <MetricCard label="Rain Probability" value={`${data.weather.current.rainfallChance}%`} helper="Near-term forecast" icon={CloudRain} />
        <MetricCard label="Wind Speed" value={`${data.weather.current.windSpeed} km/h`} helper="Useful for spray planning" icon={Wind} />
      </section>

      <section className="dash-grid xl:grid-cols-[1.12fr_0.88fr]">
        <PriceIntelligence prices={data.cropPrices || []} />
        <DashboardCard
          id="climate-irrigation"
          title="Irrigation Status"
          description="Simple recommendation based on latest weather and sensor readings."
          action={<Badge>{data.irrigation.status}</Badge>}
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary/8 p-5">
              <p className="font-display text-2xl font-semibold">{data.irrigation.status}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{data.irrigation.recommendation}</p>
              {data.irrigation.plan ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-background/70 px-3 py-2 text-xs">
                    <p className="card-label">Irrigation window</p>
                    <p className="mt-1 text-sm font-semibold">{data.irrigation.plan.window}</p>
                  </div>
                  <div className="rounded-xl bg-background/70 px-3 py-2 text-xs">
                    <p className="card-label">Duration</p>
                    <p className="mt-1 text-sm font-semibold">{data.irrigation.plan.durationMinutes} min</p>
                  </div>
                  <div className="rounded-xl bg-background/70 px-3 py-2 text-xs">
                    <p className="card-label">Review</p>
                    <p className="mt-1 text-sm font-semibold">{data.irrigation.plan.nextCheckHours} hr</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </DashboardCard>
      </section>

      <section className="dash-grid xl:grid-cols-2">
        <DashboardCard id="crop-recommendation" title="Top Crop Recommendations" description="Most suitable crops for current region and season.">
          <div className="space-y-3">
            {recommendations.map((item) => (
              <div key={item.crop} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.crop}</p>
                  <Badge variant="secondary">{item.confidence}% fit</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
            {!recommendations.length ? <p className="text-sm text-muted-foreground">No recommendations available right now.</p> : null}
          </div>
        </DashboardCard>

        <DashboardCard id="alerts" title="Recent Alerts" description="Critical and medium farm alerts that need attention.">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.severity === "HIGH" ? "destructive" : "secondary"}>{alert.severity || "INFO"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>
              </div>
            ))}
            {!alerts.length ? (
              <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No active alerts.</span>
                </div>
                <p>Everything looks stable for now.</p>
              </div>
            ) : null}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
