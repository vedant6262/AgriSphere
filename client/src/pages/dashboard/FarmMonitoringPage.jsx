import { useEffect, useState } from "react";
import { Activity, Plug, PlugZap } from "lucide-react";
import { SensorChart } from "@/components/dashboard/sensor-chart";
import { SensorGaugeGrid } from "@/components/dashboard/sensor-gauge-grid";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useSensorMonitor } from "@/hooks/use-sensor-monitor";

export function FarmMonitoringPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);
  const [lastUpdated, setLastUpdated] = useState(null);
  const {
    feed: serialFeed,
    latest,
    previous,
    isConnecting,
    serialError,
    connectSerial,
    disconnectSerial
  } = useSensorMonitor({ getToken, source: "serial" });

  useEffect(() => {
    if (serialFeed.length) {
      setLastUpdated(new Date());
    }
  }, [serialFeed]);

  const sensorFeed = serialFeed;
  const latestSensor = latest;
  const previousSensor = previous;
  const sensorContext = {
    temperature: latestSensor?.temperature ?? data?.weather?.current?.temperature ?? null,
    humidity: latestSensor?.humidity ?? data?.weather?.current?.humidity ?? null,
    soilMoisture: latestSensor?.soilMoisture ?? null
  };
  const soilMoistureValue = Number.isFinite(sensorContext.soilMoisture) ? Number(sensorContext.soilMoisture) : null;
  const irrigationPlan = data?.irrigation || null;
  const waterNeedLevel = soilMoistureValue === null ? "Unknown" : soilMoistureValue < 35 ? "High" : soilMoistureValue < 45 ? "Medium" : "Low";
  const needsWater = soilMoistureValue !== null && soilMoistureValue < 38;
  const waterStatusLabel = irrigationPlan?.status || (needsWater ? "Needs Water" : soilMoistureValue !== null && soilMoistureValue < 45 ? "Monitor" : "Healthy");
  const waterStatusVariant = needsWater ? "destructive" : waterStatusLabel === "Monitor" ? "secondary" : "default";
  const waterRecommendation =
    irrigationPlan?.recommendation ||
    (soilMoistureValue === null
      ? "Soil moisture sensor data is unavailable. Connect the sensor to get a water requirement decision."
      : needsWater
        ? "Moisture is below target. Schedule a short irrigation cycle during the coolest hours."
        : "Moisture is stable. Continue monitoring and irrigate only if levels drop.");
  const nextCheckHours = irrigationPlan?.plan?.nextCheckHours ?? (needsWater ? 3 : 12);
  const irrigationWindow = irrigationPlan?.plan?.window ?? (needsWater ? "Early morning" : "No irrigation required");

  if (isLoading) return <div className="saas-card animate-pulse">Loading farm monitoring...</div>;
  if (error || !data) return <DashboardCard title="Farm monitoring unavailable" description={`Unable to load data: ${error}`} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Farm Monitoring</p>
        <h2 className="page-title mt-2">Real-time sensor monitoring and crop survival intelligence</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Temperature, humidity, and soil moisture are read live from your connected Arduino serial stream.
        </p>
      </div>

      <section className="dash-grid">
        <DashboardCard title="Live Sensor Gauges" description="Real-time field telemetry from your connected Arduino serial stream.">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <Button type="button" variant="secondary" onClick={connectSerial} disabled={isConnecting}>
              <Plug className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Arduino"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => disconnectSerial()}>
              <PlugZap className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
            <Badge variant="secondary" className="normal-case tracking-normal">
              <Activity className="mr-2 h-3.5 w-3.5" />
              {lastUpdated ? `Last update: ${lastUpdated.toLocaleTimeString()}` : "Waiting for first live update"}
            </Badge>
          </div>
          {serialError ? <p className="mb-3 text-sm text-rose-500">{serialError}</p> : null}
          <SensorGaugeGrid latestSensor={latestSensor} previousSensor={previousSensor} />
        </DashboardCard>
      </section>

      <SensorChart sensorFeed={sensorFeed} />

      <section className="dash-grid">
        <DashboardCard title="Water Requirement" description="Decision based on soil moisture and live sensor context.">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={waterStatusVariant}>{waterStatusLabel}</Badge>
                <Badge variant="outline">{needsWater ? "Irrigation needed" : "No irrigation needed"}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{waterRecommendation}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="card-label">Water need</p>
                  <p className="mt-2 text-lg font-semibold">{waterNeedLevel}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="card-label">Window</p>
                  <p className="mt-2 text-lg font-semibold">{irrigationWindow}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="card-label">Next check</p>
                  <p className="mt-2 text-lg font-semibold">{nextCheckHours} hr</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
              <p className="card-label">Soil moisture status</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-3xl font-semibold">
                  {soilMoistureValue ?? "N/A"}
                  {soilMoistureValue !== null ? "%" : ""}
                </p>
                <p className="text-xs text-muted-foreground">Target 40-55%</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted/70">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${soilMoistureValue ?? 0}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Uses latest sensor reading to adjust irrigation advice.</p>
            </div>
          </div>
        </DashboardCard>
      </section>

    </div>
  );
}
