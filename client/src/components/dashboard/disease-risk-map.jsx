import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MapPinned, ScanSearch } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { UploadCard } from "@/components/saas/upload-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const riskStyles = {
  LOW: { label: "Low", className: "bg-emerald-500/55", badge: "default" },
  MODERATE: { label: "Moderate", className: "bg-amber-400/60", badge: "secondary" },
  HIGH: { label: "High", className: "bg-orange-500/65", badge: "secondary" },
  SEVERE: { label: "Severe", className: "bg-red-600/70", badge: "destructive" }
};

const getRiskStyle = (risk) => riskStyles[risk] || riskStyles.LOW;

export function DiseaseRiskMap({ getToken }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const imagePreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    setError("");
    setIsLoading(true);
    try {
      setResult(await dashboardApi.analyzeDiseaseRiskMap(file, getToken));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate the disease risk map.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard
      title="Farm Disease Risk Map"
      description="Segment infected regions, compare nine farm zones, and prioritize field scouting."
    >
      <div className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <UploadCard
            file={file}
            helper="JPEG or PNG overhead farm image"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setResult(null);
            }}
          />
          <Button className="w-full" type="submit" disabled={!file || isLoading}>
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
            Generate risk map
          </Button>
        </form>

        {error && <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {result && (
          <div className="space-y-5">
            {result.isDemo && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Segmentation model is not configured. This is a demo map only; set DISEASE_SEGMENTATION_API_URL for real infected-area analysis.
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/70 p-3">
                <p className="card-label">Overall risk</p>
                <Badge className="mt-2" variant={getRiskStyle(result.overallRisk).badge}>{getRiskStyle(result.overallRisk).label}</Badge>
              </div>
              <div className="rounded-xl border border-border bg-background/70 p-3">
                <p className="card-label">Affected area</p>
                <p className="mt-1 font-display text-2xl font-semibold">{result.overallAffectedPercent}%</p>
              </div>
              <div className="rounded-xl border border-border bg-background/70 p-3">
                <p className="card-label">Most affected zone</p>
                <p className="mt-1 font-display text-2xl font-semibold">{result.mostAffectedZone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Scroll horizontally or vertically to inspect the original image and infected zones in detail.</p>
              <div className="custom-scrollbar max-h-[620px] overflow-auto rounded-2xl border border-border bg-muted/60 p-3">
                <div className="grid min-w-[980px] grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm font-semibold">Original image</p>
                    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                      {imagePreviewUrl && <img src={imagePreviewUrl} alt="Original uploaded farm" className="block aspect-[4/3] h-auto w-full object-cover" />}
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {(result.zones || []).map((zone) => (
                          <div key={`original-${zone.id}`} className="relative border border-white/85">
                            <span className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 text-xs font-semibold text-white">
                              {zone.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-2 text-sm font-semibold">Infected area risk overlay</p>
                    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                      {imagePreviewUrl && <img src={imagePreviewUrl} alt="Farm disease risk overlay" className="block aspect-[4/3] h-auto w-full object-cover" />}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {(result.zones || []).map((zone) => (
                          <div key={zone.id} className={`relative border border-white/80 ${getRiskStyle(zone.risk).className}`}>
                            <span className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 text-xs font-semibold text-white">{zone.id}</span>
                            <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold text-white">{zone.affectedPercent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Zone-wise risk</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(result.zones || []).map((zone) => (
                    <div key={`summary-${zone.id}`} className="rounded-lg border border-border bg-background/70 p-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold">{zone.id}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${getRiskStyle(zone.risk).className}`} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{zone.affectedPercent}%</p>
                      <p className="text-[11px] text-muted-foreground">{getRiskStyle(zone.risk).label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  {Object.entries(riskStyles).map(([risk, style]) => (
                    <span key={risk} className="inline-flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.className}`} />{style.label}
                    </span>
                  ))}
                </div>
            </div>
            <p className="text-xs text-muted-foreground">{result.model}. Risk thresholds: &lt;5% low, 5–15% moderate, 15–30% high, &gt;30% severe.</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}