import { DashboardCard } from "@/components/saas/dashboard-card";
import { cn } from "@/lib/utils";

export function ChartCard({ id, title, description, children, className, contentClassName }) {
  return (
    <DashboardCard id={id} title={title} description={description} className={className}>
      <div className={cn("h-[320px]", contentClassName)}>{children}</div>
    </DashboardCard>
  );
}
