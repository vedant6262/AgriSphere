import { DiseaseRiskMap } from "@/components/dashboard/disease-risk-map";
import { useAppAuth } from "@/context/auth-context";

export function DiseaseRiskMapPage() {
  const { getToken } = useAppAuth();

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">PlantSeg segmentation</p>
        <h2 className="page-title mt-2">Farm disease risk map</h2>
      </div>
      <DiseaseRiskMap getToken={getToken} />
    </div>
  );
}