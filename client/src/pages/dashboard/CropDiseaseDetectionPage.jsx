import { DiseaseDetector } from "@/components/dashboard/disease-detector";
import { useAppAuth } from "@/context/auth-context";

export function CropDiseaseDetectionPage() {
  const { getToken } = useAppAuth();

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Crop Disease Detection</p>
        <h2 className="page-title mt-2">Upload and diagnose crop disease risk</h2>
      </div>
      <DiseaseDetector getToken={getToken} />
    </div>
  );
}
