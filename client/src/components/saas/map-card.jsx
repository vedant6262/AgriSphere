import { DashboardCard } from "@/components/saas/dashboard-card";

export function MapCard({ id, title, description, children, overlay }) {
  return (
    <DashboardCard id={id} title={title} description={description} className="relative overflow-hidden">
      <div className="relative h-[380px] overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">{children}</div>
      {overlay && <div className="pointer-events-none absolute right-8 top-20 max-w-xs">{overlay}</div>}
    </DashboardCard>
  );
}
