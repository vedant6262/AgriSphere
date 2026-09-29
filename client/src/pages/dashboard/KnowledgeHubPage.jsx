import { KnowledgeHub } from "@/components/dashboard/knowledge-hub";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function KnowledgeHubPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);

  if (isLoading) return <div className="saas-card animate-pulse">Loading knowledge hub...</div>;
  if (error || !data) return <DashboardCard title="Knowledge hub unavailable" description={`Unable to load data: ${error}`} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Knowledge Hub</p>
        <h2 className="page-title mt-2">Practical learning resources for farmers</h2>
      </div>
      <KnowledgeHub videos={data.videos} />
    </div>
  );
}
