import { useEffect, useMemo, useState } from "react";
import { Download, LoaderCircle, ScanSearch } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { UploadCard } from "@/components/saas/upload-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DiseaseDetector({ getToken }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const imagePreviewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await dashboardApi.analyzeDisease(file, getToken);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard id="crop-disease-detection" title="Crop Disease Detection" description="Upload a crop image to identify crop type and assess disease guidance.">
      <div className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <UploadCard
            file={file}
            helper="JPEG or PNG leaf photo for AI disease screening"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <Button className="w-full" type="submit" disabled={!file || isLoading}>
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
            Analyze crop
          </Button>
        </form>

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="card-label">Crop Analysis Report</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{result.disease}</p>
                </div>
                <Badge variant={(result.confidence || 0) > 0.75 ? "default" : "secondary"}>
                  Confidence {Math.round((result.confidence || 0) * 100)}%
                </Badge>
              </div>

              {Array.isArray(result.alternatives) && result.alternatives.length > 1 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Other likely matches: {result.alternatives.slice(1).map((item) => `${item.label} (${Math.round((item.confidence || 0) * 100)}%)`).join(", ")}
                </p>
              )}
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{result.treatment}</p>

              <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3">
                <p className="card-label">Recommended fertilizers</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {(result.fertilizersRequired || []).map((fertilizer) => (
                    <li key={fertilizer}>{fertilizer}</li>
                  ))}
                </ul>
              </div>

              <Button type="button" variant="secondary" className="mt-4 w-full sm:w-auto" onClick={handlePrintReport}>
                <Download className="mr-2 h-4 w-4" />
                Print PDF report
              </Button>
            </div>

            <section className="print-report-area rounded-2xl border border-border bg-white p-5 text-black">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xl font-semibold">Crop Disease Report</h4>
                  <p className="text-xs text-slate-600">Generated: {new Date(result.reportGeneratedAt || Date.now()).toLocaleString()}</p>
                </div>
                <p className="text-xs font-medium text-slate-600">AgriSphere Diagnostic</p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-slate-200 p-2">
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Uploaded crop" className="h-44 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image preview</div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-500">Uploaded file: {file?.name || "N/A"}</p>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Detected condition</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{result.disease}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Confidence</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{Math.round((result.confidence || 0) * 100)}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Treatment guidance</p>
                    <p className="mt-1 text-sm text-slate-700">{result.treatment}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fertilizers required</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {(result.fertilizersRequired || []).map((fertilizer) => (
                        <li key={`print-${fertilizer}`}>{fertilizer}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
