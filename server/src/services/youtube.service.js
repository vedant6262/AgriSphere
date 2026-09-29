import { fallbackVideos } from "../utils/fallback-data.js";

export const getTrainingVideos = async (query = "climate smart farming") => {
  const normalizedQuery = String(query || "").toLowerCase();
  const ranked = [...fallbackVideos].sort((a, b) => {
    const scoreA = Number(a.title.toLowerCase().includes(normalizedQuery));
    const scoreB = Number(b.title.toLowerCase().includes(normalizedQuery));
    return scoreB - scoreA;
  });

  return ranked;
};
