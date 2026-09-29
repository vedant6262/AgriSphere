import express from "express";
import multer from "multer";
import {
  getCropPrices,
  getDashboardOverview,
  getRecommendations,
  getSensors,
  getVideos,
  getWeather,
  postChatMessage,
  postDiseaseAnalysis,
  postDiseaseRiskMap
} from "../controllers/dashboard.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/overview", getDashboardOverview);
router.get("/sensors", getSensors);
router.get("/weather", getWeather);
router.get("/recommendations", getRecommendations);
router.get("/prices", getCropPrices);
router.get("/videos", getVideos);
router.post("/chat", postChatMessage);
router.post("/disease-analysis", upload.single("image"), postDiseaseAnalysis);
router.post("/disease-risk-map", upload.single("image"), postDiseaseRiskMap);

export default router;
