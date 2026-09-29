import { useEffect, useState } from "react";
import { AlertsList } from "@/components/alerts/alerts-list";
import { useAppAuth } from "@/context/auth-context";
import { alertsApi } from "@/services/api";
import { useAlertsStream } from "@/hooks/use-alerts-stream";

export function AlertsPage() {
  const { getToken } = useAppAuth();
  const [alerts, setAlerts] = useState([]);
  const [connectionState, setConnectionState] = useState("connecting");

  const loadAlerts = async () => {
    const response = await alertsApi.list(getToken);
    setAlerts(response.alerts);
  };

  useAlertsStream(getToken, (nextAlerts) => {
    setAlerts(Array.isArray(nextAlerts) ? nextAlerts : []);
    setConnectionState("live");
  });

  useEffect(() => {
    loadAlerts();
    setConnectionState("live");
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Alerts and Notifications</p>
        <h2 className="page-title mt-2">Farmer alerts for climate, irrigation, pests, and scheduled tasks</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Live status: {connectionState === "live" ? "Connected to real-time alerts" : "Connecting to alert stream..."}
        </p>
      </div>
      <AlertsList alerts={alerts} getToken={getToken} onAcknowledged={loadAlerts} />
    </div>
  );
}
