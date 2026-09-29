import { fallbackGovernmentSchemes } from "../utils/fallback-data.js";

const regionBuckets = {
  "western india": ["scheme-pmkisan", "scheme-pmfbys", "scheme-kcc"],
  "northern india": ["scheme-pmkisan", "scheme-pmfbys", "scheme-kcc"],
  "southern india": ["scheme-pmkisan", "scheme-pmfbys", "scheme-kcc"]
};

export const getGovernmentSchemes = (region) => {
  const normalizedRegion = (region || "").trim().toLowerCase();
  const filteredIds = regionBuckets[normalizedRegion];
  const withOfficialTags = fallbackGovernmentSchemes.map((scheme) => ({
    ...scheme,
    isOfficialSource: true,
    lastSynced: new Date().toISOString()
  }));

  if (!filteredIds) {
    return withOfficialTags;
  }

  return withOfficialTags.filter((scheme) => filteredIds.includes(scheme.id));
};
