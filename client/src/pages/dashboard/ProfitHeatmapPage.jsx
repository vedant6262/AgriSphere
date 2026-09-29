import { ProfitHeatmapMap } from "@/components/maps/profit-heatmap-map";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { useAppAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function ProfitHeatmapPage() {
  const { getToken } = useAppAuth();
  const { theme } = useTheme();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) return <div className="saas-card animate-pulse">Loading profit heatmap intelligence...</div>;
  if (error || !data) return <DashboardCard title="Profit heatmap unavailable" description={`Unable to load data: ${error}`} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">AI Profit Heatmap</p>
        <h2 className="page-title mt-2">Precision farming profitability map with zone-wise decision support</h2>
      </div>

      <ProfitHeatmapMap settings={data.settings} weather={data.weather} cropPrices={data.cropPrices} theme={theme} />
    </div>
  );
}
