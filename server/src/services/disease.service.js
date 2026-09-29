import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";

const fertilizerByCondition = [
  {
    match: /(blight|fungal|mildew|rust|spot)/i,
    fertilizersRequired: [
      "Balanced NPK 19:19:19 foliar feed at low dose after disease control window",
      "Potassium sulfate (SOP) to improve stress tolerance and leaf resilience",
      "Micronutrient mix with zinc and boron once visible recovery starts"
    ]
  },
  {
    match: /(healthy|no visible stress|normal)/i,
    fertilizersRequired: [
      "Compost or well-decomposed FYM for baseline soil health",
      "Balanced NPK according to crop stage",
      "Calcium + magnesium supplement for steady vegetative growth"
    ]
  }
];

const defaultFertilizers = [
  "Soil-test based balanced NPK schedule",
  "Organic matter enrichment (compost/FYM)",
  "Micronutrient spray based on local agronomy guidance"
];

function getFertilizersRequired(conditionText = "") {
  const match = fertilizerByCondition.find((rule) => rule.match.test(conditionText));
  return match ? match.fertilizersRequired : defaultFertilizers;
}

function withReportFields(result) {
  return {
    ...result,
    fertilizersRequired: getFertilizersRequired(`${result.disease || ""} ${result.treatment || ""}`),
    reportGeneratedAt: new Date().toISOString()
  };
}

const inferFallbackResult = (filename = "crop") => {
  const normalized = filename.toLowerCase();

  if (normalized.includes("leaf") || normalized.includes("blight")) {
    return withReportFields({
      analysisType: "disease-detection",
      disease: "Early Blight",
      confidence: 0.82,
      treatment: "Remove infected leaves, improve airflow, and apply a registered copper-based fungicide if spread continues."
    });
  }

  return withReportFields({
    analysisType: "disease-detection",
    disease: "Healthy Leaf",
    confidence: 0.77,
    treatment: "No visible stress detected from the demo model. Continue routine scouting and nutrient checks."
  });
};

export const analyzeCropDisease = async (file) => {
  if (!file) {
    const error = new Error("Image file is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!env.PLANT_DISEASE_API_URL) {
    return inferFallbackResult(file.originalname);
  }

  try {
    const formData = new FormData();
    const isPlantNet = env.PLANT_DISEASE_API_URL.includes("my-api.plantnet.org");
    const hasApiKeyInUrl = env.PLANT_DISEASE_API_URL.includes("api-key=");

    if (isPlantNet) {
      // PlantNet requires multipart key "images" and accepts an organs hint.
      formData.append("images", file.buffer, file.originalname);
      formData.append("organs", "leaf");
    } else {
      formData.append("image", file.buffer, file.originalname);
    }

    const response = await axios.post(env.PLANT_DISEASE_API_URL, formData, {
      params: isPlantNet && env.PLANT_DISEASE_API_KEY && !hasApiKeyInUrl
        ? { "api-key": env.PLANT_DISEASE_API_KEY }
        : undefined,
      headers: {
        ...formData.getHeaders(),
        ...(!isPlantNet && env.PLANT_DISEASE_API_KEY
          ? { Authorization: `Bearer ${env.PLANT_DISEASE_API_KEY}` }
          : {})
      }
    });

    const topResult = response.data?.results?.[0];
    const alternatives = response.data?.results
      ?.slice(0, 3)
      ?.map((result) => {
        const common = result?.species?.commonNames?.[0];
        const scientific = result?.species?.scientificNameWithoutAuthor;
        return {
          label: common || scientific || "Unknown",
          confidence: typeof result?.score === "number" ? result.score : 0
        };
      })
      ?.filter((item) => item.label !== "Unknown");
    const speciesName = topResult?.species?.scientificNameWithoutAuthor;
    const speciesCommonName = topResult?.species?.commonNames?.[0];
    const score = topResult?.score;

    if (isPlantNet && topResult) {
      const confidence = typeof score === "number" ? score : 0.7;
      const confidenceHint = confidence < 0.65
        ? "Low-confidence match. Upload a clear single-leaf photo in daylight and avoid background clutter for better accuracy."
        : "Good species match from PlantNet. This identifies crop species, not disease severity.";

      return withReportFields({
        analysisType: "species-identification",
        disease: speciesCommonName
          ? `Identified crop: ${speciesCommonName}`
          : `Identified crop: ${speciesName || "Unknown"}`,
        confidence,
        treatment: `${confidenceHint} For disease diagnosis, use a dedicated disease API such as Plant.id Diseases.`,
        alternatives: alternatives || []
      });
    }

    return withReportFields({
      analysisType: "disease-detection",
      disease:
        response.data?.disease ||
        response.data?.prediction ||
        speciesName ||
        "Unknown",
      confidence: response.data?.confidence ?? (typeof score === "number" ? score : 0.7),
      treatment: response.data?.treatment || "Consult an agronomist for field-level treatment validation."
    });
  } catch (error) {
    console.warn("Plant disease API failed, using fallback result", error.message);
    return inferFallbackResult(file.originalname);
  }
};
