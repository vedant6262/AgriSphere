import { useEffect, useState } from "react";
import { ExternalLink, Landmark } from "lucide-react";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/context/auth-context";
import { governmentSchemesApi } from "@/services/api";

export function GovernmentSchemesPage() {
  const { getToken } = useAppAuth();
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    governmentSchemesApi
      .list(getToken)
      .then((response) => setSchemes(response.schemes || []))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Government Support</p>
        <h2 className="page-title mt-2">Schemes and subsidies for your farm profile</h2>
      </div>

      {error ? <DashboardCard title="Schemes unavailable" description={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {schemes.map((scheme) => (
          <DashboardCard key={scheme.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-semibold">{scheme.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{scheme.provider}</p>
              </div>
              <Landmark className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{scheme.category}</Badge>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Eligibility:</span> {scheme.eligibility}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Benefit:</span> {scheme.benefit}
            </p>

            {scheme.sourceUrl && (
              <a href={scheme.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
                Source: {scheme.sourceLabel || "Official government portal"}
              </a>
            )}

            <Button asChild className="mt-5" size="sm">
              <a href={scheme.applyUrl} target="_blank" rel="noreferrer">
                Apply / View details
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
