import { FarmMap } from "@/components/maps/farm-map";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function FarmMapPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) return <div className="saas-card animate-pulse">Loading farm map...</div>;
  if (error || !data) return <DashboardCard title="Farm map unavailable" description={`Unable to load data: ${error}`} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Farm Map</p>
        <h2 className="page-title mt-2">Geospatial field view and live weather context</h2>
      </div>
      <FarmMap settings={data.settings} weather={data.weather} />
    </div>
  );
}
