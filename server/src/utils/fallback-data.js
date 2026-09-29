export const fallbackSensors = [
  { timestamp: "2026-03-15T04:00:00.000Z", soilMoisture: 41, humidity: 70, temperature: 27 },
  { timestamp: "2026-03-15T06:00:00.000Z", soilMoisture: 39, humidity: 68, temperature: 28 },
  { timestamp: "2026-03-15T08:00:00.000Z", soilMoisture: 37, humidity: 66, temperature: 30 },
  { timestamp: "2026-03-15T10:00:00.000Z", soilMoisture: 35, humidity: 63, temperature: 31 },
  { timestamp: "2026-03-15T12:00:00.000Z", soilMoisture: 34, humidity: 62, temperature: 33 },
  { timestamp: "2026-03-15T14:00:00.000Z", soilMoisture: 32, humidity: 59, temperature: 34 }
];

export const fallbackWeather = {
  location: "Nashik Farm Cluster",
  current: {
    temperature: 31,
    humidity: 64,
    windSpeed: 13,
    rainfallChance: 24,
    summary: "Partly cloudy with dry wind by afternoon"
  },
  forecast: [
    { day: "Mon", temperature: 31, rainfall: 24, humidity: 64, windSpeed: 13 },
    { day: "Tue", temperature: 29, rainfall: 46, humidity: 72, windSpeed: 10 },
    { day: "Wed", temperature: 30, rainfall: 32, humidity: 69, windSpeed: 11 },
    { day: "Thu", temperature: 33, rainfall: 12, humidity: 58, windSpeed: 15 },
    { day: "Fri", temperature: 32, rainfall: 18, humidity: 60, windSpeed: 14 }
  ]
};

export const fallbackCropRecommendations = [
  {
    crop: "Millets",
    confidence: 92,
    reason: "Water-efficient and resilient for semi-arid heat fluctuations."
  },
  {
    crop: "Chickpea",
    confidence: 87,
    reason: "Fits moderate soil moisture and current seasonal demand."
  },
  {
    crop: "Tomato",
    confidence: 79,
    reason: "Suitable if drip irrigation is applied during the next 10 days."
  }
];

export const fallbackCropPrices = [
  { crop: "Tomato", market: "Pune", price: 18, trend: "up", change: 5.2 },
  { crop: "Onion", market: "Nashik", price: 21, trend: "down", change: -2.1 },
  { crop: "Wheat", market: "Indore", price: 29, trend: "up", change: 1.3 },
  { crop: "Maize", market: "Nagpur", price: 24, trend: "up", change: 2.8 }
];

export const fallbackVideos = [
  {
    id: "vid-1",
    title: "Tomato Early Blight: Identification and Field Management",
    channelTitle: "Agri Disease School",
    thumbnail: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=4f4QwzE6V2A"
  },
  {
    id: "vid-2",
    title: "Powdery Mildew in Cucurbits: Symptoms and Control Plan",
    channelTitle: "Farm Clinic India",
    thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=3D8uQ4WnS5Y"
  },
  {
    id: "vid-3",
    title: "Rice Blast Disease: Prevention and Spray Timing",
    channelTitle: "Krishi Knowledge Hub",
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    url: "https://www.youtube.com/watch?v=2Tz4Vnq8R0k"
  }
];

export const fallbackCommunityPosts = [
  {
    id: "post-1",
    authorName: "Ravi Patil",
    title: "Best schedule for irrigating tomatoes during sudden heat spikes?",
    content: "My soil moisture is dropping from 45% to 32% within a day. Looking for a practical schedule with mulch and drip.",
    createdAt: "2026-03-15T08:30:00.000Z",
    comments: [
      {
        id: "comment-1",
        authorName: "Meera Joshi",
        content: "We switched to early-morning pulses and added mulch thickness to 6 cm. It reduced daytime stress.",
        createdAt: "2026-03-15T09:10:00.000Z"
      }
    ]
  },
  {
    id: "post-2",
    authorName: "Asha Nair",
    title: "Anyone using weather forecasts to time foliar spray?",
    content: "Trying to avoid wash-off losses. Do you wait for under 20% rainfall probability or use wind speed too?",
    createdAt: "2026-03-14T16:00:00.000Z",
    comments: []
  }
];

export const fallbackExpenses = [
  { id: "exp-1", category: "SEEDS", amount: 120, month: 1, year: 2026, notes: "Hybrid tomato seeds" },
  { id: "exp-2", category: "FERTILIZER", amount: 180, month: 1, year: 2026, notes: "Micronutrient blend" },
  { id: "exp-3", category: "LABOR", amount: 240, month: 2, year: 2026, notes: "Irrigation maintenance" },
  { id: "exp-4", category: "EQUIPMENT", amount: 310, month: 3, year: 2026, notes: "Sensor replacement" }
];

export const fallbackAlerts = [
  {
    id: "alert-1",
    type: "WEATHER",
    severity: "HIGH",
    title: "Heavy rainfall risk within 36 hours",
    description: "Delay fertilizer application and inspect drainage channels before Tuesday morning.",
    issuedAt: "2026-03-15T05:30:00.000Z",
    acknowledged: false
  },
  {
    id: "alert-2",
    type: "PEST",
    severity: "MEDIUM",
    title: "Leaf miner pressure increasing",
    description: "Scout tomato plots on the south boundary and review trap counts after sunset.",
    issuedAt: "2026-03-15T07:00:00.000Z",
    acknowledged: false
  }
];

export const fallbackSettings = {
  farmName: "AgriSphere Demo Farm",
  farmerName: "Demo Farmer",
  location: "Nashik, Maharashtra",
  latitude: 20.0059,
  longitude: 73.791,
  cropType: "Tomato",
  region: "Western India",
  season: "Kharif",
  farmSizeAcres: 2.5,
  irrigationMethod: "Drip irrigation",
  preferredLanguage: "English",
  phoneNumber: "+91 90000 00000",
  soilType: "Loamy",
  useCurrentLocation: false,
  tempLowThreshold: 18,
  tempHighThreshold: 35,
  sensorChannelId: "demo-channel",
  sensorFieldSoil: 1,
  sensorFieldHum: 2,
  sensorFieldTemp: 3
};

export const fallbackGovernmentSchemes = [
  {
    id: "scheme-pmkisan",
    title: "PM-KISAN Income Support",
    provider: "Government of India",
    category: "Income Support",
    eligibility: "Small and marginal landholding farmer families",
    benefit: "INR 6,000 per year in three installments",
    applyUrl: "https://pmkisan.gov.in/",
    sourceUrl: "https://pmkisan.gov.in/",
    sourceLabel: "PM-KISAN Official Portal"
  },
  {
    id: "scheme-pmfbys",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    provider: "Government of India",
    category: "Crop Insurance",
    eligibility: "Farmers growing notified crops in notified areas",
    benefit: "Insurance support for yield loss due to weather and natural risks",
    applyUrl: "https://pmfby.gov.in/",
    sourceUrl: "https://pmfby.gov.in/",
    sourceLabel: "PMFBY Official Portal"
  },
  {
    id: "scheme-kcc",
    title: "Kisan Credit Card (KCC)",
    provider: "Public Sector Banks and Cooperative Banks",
    category: "Credit",
    eligibility: "Farmers, tenant farmers, and self-help groups engaged in agriculture",
    benefit: "Short-term working capital for crop and allied activities",
    applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
    sourceUrl: "https://www.myscheme.gov.in/schemes/kcc",
    sourceLabel: "MyScheme Official Listing"
  }
];
