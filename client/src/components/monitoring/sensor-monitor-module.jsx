import { Activity, Plug, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { SensorMonitorCards } from "@/components/monitoring/sensor-monitor-cards";
import { SensorMonitorCharts } from "@/components/monitoring/sensor-monitor-charts";
import { useSensorMonitor } from "@/hooks/use-sensor-monitor";

export function SensorMonitorModule({ getToken, source = "api" }) {
  const { feed, latest, previous, isConnecting, serialError, connectSerial, disconnectSerial } = useSensorMonitor({ getToken, source });

  return (
    <div className="space-y-5">
      <DashboardCard
        title="Sensor Stream Monitor"
        description="Structured monitoring module with swappable API or Serial input"
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Activity className="h-3.5 w-3.5" />
            {source.toUpperCase()} Source
          </span>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={connectSerial} disabled={source !== "serial" || isConnecting}>
            <Plug className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Serial"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => disconnectSerial()} disabled={source !== "serial"}>
            <PlugZap className="mr-2 h-4 w-4" />
            Disconnect Serial
          </Button>
        </div>
        {serialError ? <p className="mt-2 text-sm text-rose-500">{serialError}</p> : null}
      </DashboardCard>

      <SensorMonitorCards latest={latest} previous={previous} />
      <SensorMonitorCharts feed={feed} />
    </div>
  );
}