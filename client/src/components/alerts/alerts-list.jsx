import { AlertTriangle, Bug, CloudRain, Siren } from "lucide-react";
import { alertsApi } from "@/services/api";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const alertIcons = {
  WEATHER: CloudRain,
  PEST: Bug,
  CLIMATE: AlertTriangle
};

const severityVariant = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  CRITICAL: "destructive"
};

export function AlertsList({ alerts = [], getToken, onAcknowledged }) {
  const handleAcknowledge = async (id) => {
    await alertsApi.acknowledge(id, getToken);
    await onAcknowledged();
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const Icon = alertIcons[alert.type] || Siren;
        return (
          <DashboardCard key={alert.id} className="p-4 sm:p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display text-xl font-semibold">{alert.title}</p>
                    <Badge variant={severityVariant[alert.severity] || "outline"}>{alert.severity}</Badge>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{alert.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{formatDate(alert.issuedAt)}</p>
                </div>
              </div>
              <Button variant={alert.acknowledged ? "outline" : "default"} onClick={() => handleAcknowledge(alert.id)} disabled={alert.acknowledged}>
                {alert.acknowledged ? "Acknowledged" : "Acknowledge"}
              </Button>
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
}
