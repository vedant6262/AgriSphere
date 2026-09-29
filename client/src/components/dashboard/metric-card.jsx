import { StatCard } from "@/components/saas/stat-card";

export function MetricCard({ label, value, helper, icon: Icon }) {
  return <StatCard label={label} value={value} helper={helper} icon={Icon} />;
}
