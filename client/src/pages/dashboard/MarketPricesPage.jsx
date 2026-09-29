import { PriceIntelligence } from "@/components/dashboard/price-intelligence";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function MarketPricesPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) return <div className="saas-card animate-pulse">Loading market prices...</div>;
  if (error || !data) return <DashboardCard title="Market prices unavailable" description={`Unable to load data: ${error}`} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Market Prices</p>
        <h2 className="page-title mt-2">Crop market signals and trend intelligence</h2>
      </div>
      <PriceIntelligence prices={data.cropPrices} />
    </div>
  );
}
