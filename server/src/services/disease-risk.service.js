import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";
import { getPrisma } from "../lib/prisma.js";
import { getFarmSettings } from "./settings.service.js";

const GRID_SIZE = 3;
const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "SEVERE"];

const riskForPercent = (affectedPercent) => {
  if (affectedPercent < 5) return "LOW";
  if (affectedPercent < 15) return "MODERATE";
  if (affectedPercent < 30) return "HIGH";
  return "SEVERE";
};

const zoneName = (row, column) => `${String.fromCharCode(65 + row)}${column + 1}`;

const demoMask = (fileName = "farm") => {
  const seed = [...fileName].reduce((total, character) => total + character.charCodeAt(0), 0);
  return Array.from({ length: 30 }, (_, row) => Array.from({ length: 30 }, (_, column) => {
    const zone = Math.floor(row / 10) * 3 + Math.floor(column / 10);
    return ((seed + zone * 17 + row * 3 + column) % 100) < (zone === seed % 9 ? 42 : 8) ? 1 : 0;
  }));
};

const normalizeMask = (mask) => {
  if (!Array.isArray(mask) || !mask.length || !Array.isArray(mask[0])) return null;
  return mask;
};

const calculateZones = (mask) => {
  const height = mask.length;
  const width = mask[0].length;
  const zones = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const startY = Math.floor((row * height) / GRID_SIZE);
      const endY = Math.floor(((row + 1) * height) / GRID_SIZE);
      const startX = Math.floor((column * width) / GRID_SIZE);
      const endX = Math.floor(((column + 1) * width) / GRID_SIZE);
      let affectedPixels = 0;
      let totalPixels = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          totalPixels += 1;
          if (Number(mask[y][x]) > 0.5) affectedPixels += 1;
        }
      }

      const affectedPercent = totalPixels ? Number(((affectedPixels / totalPixels) * 100).toFixed(2)) : 0;
      zones.push({
        id: zoneName(row, column),
        affectedPercent,
        risk: riskForPercent(affectedPercent)
      });
    }
  }

  return zones;
};

const getSegmentationMask = async (file) => {
  if (!env.DISEASE_SEGMENTATION_API_URL) {
    if (env.ALLOW_DEMO_MODE) {
      return { mask: demoMask(file.originalname), isDemo: true };
    }
    const error = new Error("Disease segmentation is not configured. Set DISEASE_SEGMENTATION_API_URL to a trained model endpoint.");
    error.statusCode = 503;
    throw error;
  }

  const formData = new FormData();
  formData.append("image", file.buffer, file.originalname);
  const response = await axios.post(env.DISEASE_SEGMENTATION_API_URL, formData, {
    headers: {
      ...formData.getHeaders(),
      ...(env.DISEASE_SEGMENTATION_API_KEY
        ? { Authorization: `Bearer ${env.DISEASE_SEGMENTATION_API_KEY}` }
        : {})
    },
    timeout: 60000
  });

  const mask = normalizeMask(response.data?.mask || response.data?.segmentation);
  if (!mask) {
    const error = new Error("Segmentation API must return a 2D mask in `mask` or `segmentation`.");
    error.statusCode = 502;
    throw error;
  }
  return { mask, isDemo: false };
};

export const analyzeDiseaseRiskMap = async (file, clerkUserId) => {
  if (!file) {
    const error = new Error("Farm image is required.");
    error.statusCode = 400;
    throw error;
  }

  const segmentation = await getSegmentationMask(file);
  const mask = segmentation.mask;

  const zones = calculateZones(mask);
  const overallAffectedPercent = Number((zones.reduce((sum, zone) => sum + zone.affectedPercent, 0) / zones.length).toFixed(2));
  const mostAffectedZone = zones.reduce((mostAffected, zone) => (
    zone.affectedPercent > mostAffected.affectedPercent ? zone : mostAffected
  ), zones[0]);
  const result = {
    analysisType: "disease-risk-map",
    sourceFileName: file.originalname,
    overallRisk: riskForPercent(overallAffectedPercent),
    overallAffectedPercent,
    mostAffectedZone: mostAffectedZone.id,
    zones,
    generatedAt: new Date().toISOString(),
    model: segmentation.isDemo ? "Demo placeholder: configure PlantSeg model for real analysis" : "Configured disease segmentation service",
    isDemo: segmentation.isDemo
  };

  const prisma = await getPrisma();
  if (prisma && clerkUserId) {
    try {
      const farmProfile = await getFarmSettings(clerkUserId);
      if (farmProfile.id !== "demo-settings") {
        await prisma.diseaseRiskAnalysis.create({
          data: {
            farmProfileId: farmProfile.id,
            sourceFileName: file.originalname,
            overallRisk: result.overallRisk,
            overallAffectedPercent,
            mostAffectedZone: result.mostAffectedZone,
            zonesJson: zones
          }
        });
      }
    } catch (error) {
      console.warn("[disease-risk-map] unable to persist analysis", error.message);
    }
  }

  return { ...result, riskLevels: RISK_LEVELS };
};