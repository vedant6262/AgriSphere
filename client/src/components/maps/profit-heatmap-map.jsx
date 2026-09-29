import { useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { AlertTriangle, ChevronsLeft, ChevronsRight, Droplets, Leaf, Layers, MapPinned, TrendingUp } from "lucide-react";

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const cropCatalog = {
  wheat: { label: "Wheat", baseYieldKgHa: 4200, baseCostInrHa: 54000, basePriceInrKg: 30 },
  rice: { label: "Rice", baseYieldKgHa: 5000, baseCostInrHa: 68000, basePriceInrKg: 28 },
  onion: { label: "Onion", baseYieldKgHa: 18000, baseCostInrHa: 120000, basePriceInrKg: 23 },
  maize: { label: "Maize", baseYieldKgHa: 4700, baseCostInrHa: 52000, basePriceInrKg: 24 },
  soybean: { label: "Soybean", baseYieldKgHa: 2800, baseCostInrHa: 46000, basePriceInrKg: 42 }
};

const seasonFactor = {
  kharif: 1,
  rabi: 0.95
};

const cityCenters = {
  pune: [73.8567, 18.5204],
  nashik: [73.7898, 19.9975],
  nagpur: [79.0882, 21.1458],
  indore: [75.8577, 22.7196],
  mumbai: [72.8777, 19.076]
};

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function buildGrid(centerLng, centerLat, rows = 3, cols = 4, cellSize = 0.012) {
  const zones = [];
  let id = 1;

  const startLng = centerLng - (cols * cellSize) / 2;
  const startLat = centerLat - (rows * cellSize) / 2;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const lng = startLng + c * cellSize;
      const lat = startLat + r * cellSize;
      zones.push({
        id: `Z-${id}`,
        polygon: [
          [lng, lat],
          [lng + cellSize, lat],
          [lng + cellSize, lat + cellSize],
          [lng, lat + cellSize],
          [lng, lat]
        ]
      });
      id += 1;
    }
  }

  return zones;
}

function getRecommendation(metrics) {
  const notes = [];

  if (metrics.soilMoisture < 34) {
    notes.push("⚠️ Dry soil");
    notes.push("💧 Irrigation needed");
  }

  if (metrics.fertility < 55) {
    notes.push("⚠️ Low fertility zone");
  }

  if (metrics.profit > 150000) {
    notes.push(`Best for ${metrics.cropLabel}`);
  }

  if (metrics.profit < 0) {
    notes.push("Low profitability zone");
  }

  return notes.length ? notes.join(" • ") : `Stable profit zone for ${metrics.cropLabel}`;
}

export function ProfitHeatmapMap({ settings, weather, cropPrices = [], theme = "light" }) {
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [selectedSeason, setSelectedSeason] = useState("kharif");
  const [selectedMandi, setSelectedMandi] = useState(cropPrices[0]?.market || "Pune");
  const [selectedCity, setSelectedCity] = useState(cropPrices[0]?.market || settings?.location?.split(",")?.[0] || "Pune");
  const [activeLayer, setActiveLayer] = useState("profit");
  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(true);
  const [timeStep, setTimeStep] = useState(3);
  const [tick, setTick] = useState(0);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const hoverRef = useRef(null);

  const normalizedCity = String(selectedCity || "").toLowerCase();
  const cityCenter = cityCenters[normalizedCity] || [settings?.longitude ?? 73.8567, settings?.latitude ?? 18.5204];
  const [baseLng, baseLat] = cityCenter;
  const mapStyle = theme === "dark" ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/satellite-streets-v12";

  const mandiOptions = useMemo(() => {
    const markets = [...new Set(cropPrices.map((price) => price.market).filter(Boolean))];
    return markets.length ? markets : ["Pune", "Nashik", "Nagpur"];
  }, [cropPrices]);

  useEffect(() => {
    if (!mandiOptions.includes(selectedMandi)) {
      setSelectedMandi(mandiOptions[0]);
    }
  }, [mandiOptions, selectedMandi]);

  useEffect(() => {
    if (!mandiOptions.includes(selectedCity)) {
      setSelectedCity(mandiOptions[0]);
    }
  }, [mandiOptions, selectedCity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((value) => value + 1);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const zones = useMemo(() => {
    const crop = cropCatalog[selectedCrop] || cropCatalog.maize;
    const factor = seasonFactor[selectedSeason] || 1;
    const weatherSignal = clamp((weather?.current?.rainfallChance ?? 20) / 100, 0, 1);
    const timeSignal = 1 + (timeStep - 3) * 0.025;
    const selectedMarketEntries = cropPrices.filter(
      (item) => String(item.market || "").toLowerCase() === selectedMandi.toLowerCase()
    );
    const avgMarketTrend = selectedMarketEntries.length
      ? selectedMarketEntries.reduce((sum, item) => sum + Number(item.change || 0), 0) / selectedMarketEntries.length
      : 0;
    const marketTrendFactor = clamp(1 + avgMarketTrend / 100, 0.82, 1.25);

    return buildGrid(baseLng, baseLat).map((zone, index) => {
      const noise = Math.sin((index + 1) * 1.7 + tick * 0.35);
      const soilMoisture = clamp(Math.round(30 + weatherSignal * 22 + noise * 8), 12, 88);
      const fertility = clamp(Math.round(52 + (index % 4) * 10 + noise * 6), 30, 96);
      const irrigationNeed = clamp(Math.round(100 - soilMoisture), 5, 90);

      const mandiPrice =
        cropPrices.find(
          (item) =>
            String(item.market || "").toLowerCase() === selectedMandi.toLowerCase() &&
            String(item.crop || "").toLowerCase() === selectedCrop.toLowerCase()
        )?.price || crop.basePriceInrKg;

      const yieldFactor = clamp(0.58 + fertility / 140 + soilMoisture / 260, 0.4, 1.45);
      const predictedYield = Math.round(crop.baseYieldKgHa * factor * timeSignal * yieldFactor);

      const seedCost = Math.round(crop.baseCostInrHa * 0.18 * (0.95 + (index % 3) * 0.04));
      const fertilizerCost = Math.round(crop.baseCostInrHa * 0.34 * (1 + (90 - fertility) / 300));
      const laborCost = Math.round(crop.baseCostInrHa * 0.28 * (0.9 + (index % 2) * 0.1));
      const waterCost = Math.round(crop.baseCostInrHa * 0.2 * (0.75 + irrigationNeed / 120));
      const totalCost = seedCost + fertilizerCost + laborCost + waterCost;

      const revenue = Math.round(predictedYield * mandiPrice * marketTrendFactor);
      const profit = revenue - totalCost;

      const metrics = {
        zoneId: zone.id,
        crop: selectedCrop,
        cropLabel: crop.label,
        soilMoisture,
        fertility,
        predictedYield,
        mandiPrice,
        totalCost,
        seedCost,
        fertilizerCost,
        laborCost,
        waterCost,
        profit,
        suitabilityScore: Math.round(clamp((fertility * 0.55 + soilMoisture * 0.45), 0, 100)),
        irrigationNeed,
        avgMarketTrend,
        recommendation: ""
      };

      metrics.recommendation = getRecommendation(metrics);
      return { ...zone, ...metrics };
    });
  }, [baseLat, baseLng, cropPrices, selectedCrop, selectedMandi, selectedSeason, tick, timeStep, weather?.current?.rainfallChance]);

  const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId) || zones[0];

  const analytics = useMemo(() => {
    const totalProfit = zones.reduce((sum, zone) => sum + zone.profit, 0);

    const highestZone = zones.reduce((best, current) => (current.profit > best.profit ? current : best), zones[0]);
    const lowestZone = zones.reduce((best, current) => (current.profit < best.profit ? current : best), zones[0]);

    const bestCrop = Object.entries(cropCatalog)
      .map(([key, crop]) => {
        const market =
          cropPrices.find(
            (item) =>
              String(item.market || "").toLowerCase() === selectedMandi.toLowerCase() &&
              String(item.crop || "").toLowerCase() === key.toLowerCase()
          )?.price || crop.basePriceInrKg;

        const estimate = crop.baseYieldKgHa * market - crop.baseCostInrHa;
        return { key, label: crop.label, estimate };
      })
      .sort((a, b) => b.estimate - a.estimate)[0];

    return {
      totalProfit,
      highestZone,
      lowestZone,
      bestCrop
    };
  }, [cropPrices, selectedMandi, zones]);

  const geoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: zones.map((zone) => ({
        id: zone.zoneId,
        type: "Feature",
        properties: {
          zoneId: zone.zoneId,
          soilMoisture: zone.soilMoisture,
          fertility: zone.fertility,
          suitabilityScore: zone.suitabilityScore,
          irrigationNeed: zone.irrigationNeed,
          profit: zone.profit
        },
        geometry: {
          type: "Polygon",
          coordinates: [zone.polygon]
        }
      }))
    }),
    [zones]
  );

  const getLayerColorExpression = (layerType) => {
    if (layerType === "moisture") {
      return ["interpolate", ["linear"], ["get", "soilMoisture"], 10, "#ef4444", 35, "#f59e0b", 55, "#22c55e", 80, "#06b6d4"];
    }

    if (layerType === "suitability") {
      return ["interpolate", ["linear"], ["get", "suitabilityScore"], 20, "#f97316", 45, "#eab308", 70, "#84cc16", 95, "#22c55e"];
    }

    if (layerType === "irrigation") {
      return ["interpolate", ["linear"], ["get", "irrigationNeed"], 15, "#22c55e", 40, "#facc15", 70, "#f97316", 90, "#dc2626"];
    }

    return ["interpolate", ["linear"], ["get", "profit"], -120000, "#dc2626", 0, "#f59e0b", 130000, "#84cc16", 250000, "#16a34a"];
  };

  useEffect(() => {
    if (!mapboxToken || !containerRef.current) {
      return undefined;
    }

    let isCancelled = false;

    import("mapbox-gl").then((module) => {
      if (isCancelled || mapRef.current) {
        return;
      }

      const mapboxgl = module.default;
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: mapStyle,
        center: [baseLng, baseLat],
        zoom: 14,
        pitch: 42,
        bearing: -22,
        antialias: true
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!map.getSource("profit-zones")) {
          map.addSource("profit-zones", { type: "geojson", data: geoJson });
        }

        map.addLayer({
          id: "profit-zones-fill",
          type: "fill",
          source: "profit-zones",
          paint: {
            "fill-color": getLayerColorExpression(activeLayer),
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.85,
              0.62
            ],
            "fill-outline-color": "rgba(255,255,255,0.42)",
            "fill-color-transition": { duration: 450, delay: 0 },
            "fill-opacity-transition": { duration: 250, delay: 0 }
          }
        });

        map.addLayer({
          id: "profit-zones-line",
          type: "line",
          source: "profit-zones",
          paint: {
            "line-color": "rgba(255,255,255,0.55)",
            "line-width": 1.2,
            "line-opacity": 0.8
          }
        });

        map.on("mousemove", "profit-zones-fill", (event) => {
          if (!event.features?.length) return;

          if (hoverRef.current != null) {
            map.setFeatureState({ source: "profit-zones", id: hoverRef.current }, { hover: false });
          }

          const hoveredId = event.features[0].id;
          if (hoveredId == null) {
            return;
          }
          hoverRef.current = hoveredId;
          map.setFeatureState({ source: "profit-zones", id: hoveredId }, { hover: true });
        });

        map.on("mouseleave", "profit-zones-fill", () => {
          if (hoverRef.current != null) {
            map.setFeatureState({ source: "profit-zones", id: hoverRef.current }, { hover: false });
          }
          hoverRef.current = null;
        });

        map.on("click", "profit-zones-fill", (event) => {
          const zoneId = event.features?.[0]?.properties?.zoneId;
          if (zoneId) {
            setSelectedZoneId(zoneId);
          }
        });
      });
    });

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [baseLat, baseLng, mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("profit-zones");
    if (source) {
      source.setData(geoJson);
    }

    if (map.getLayer("profit-zones-fill")) {
      map.setPaintProperty("profit-zones-fill", "fill-color", getLayerColorExpression(activeLayer));
    }
  }, [activeLayer, geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [baseLng, baseLat],
      zoom: 13.8,
      essential: true,
      duration: 900
    });
  }, [baseLat, baseLng]);

  useEffect(() => {
    if (!selectedZoneId && zones.length) {
      setSelectedZoneId(zones[0].zoneId);
    }
  }, [selectedZoneId, zones]);

  if (!mapboxToken) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-background/60 p-10 text-center">
        <MapPinned className="mx-auto mb-3 h-10 w-10 text-primary" />
        <p className="font-display text-2xl font-semibold">Mapbox key missing</p>
        <p className="mt-2 text-sm text-muted-foreground">Add VITE_MAPBOX_ACCESS_TOKEN in client env to enable Profit Heatmap map experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-400/20 bg-card/70 p-4 backdrop-blur-xl">
          <p className="card-label">Total predicted farm profit</p>
          <p className={`mt-2 text-2xl font-semibold ${analytics.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatInr(analytics.totalProfit)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-card/70 p-4 backdrop-blur-xl">
          <p className="card-label">Most profitable crop</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.bestCrop?.label || "-"}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-card/70 p-4 backdrop-blur-xl">
          <p className="card-label">Highest earning zone</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.highestZone?.zoneId || "-"}</p>
          <p className="mt-1 text-sm text-emerald-600">{formatInr(analytics.highestZone?.profit || 0)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-card/70 p-4 backdrop-blur-xl">
          <p className="card-label">Lowest performing zone</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.lowestZone?.zoneId || "-"}</p>
          <p className="mt-1 text-sm text-rose-600">{formatInr(analytics.lowestZone?.profit || 0)}</p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10 p-3">
        <div className="relative h-[680px] overflow-hidden rounded-2xl border border-border/70">
          <div ref={containerRef} className="h-full w-full" />

          <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-1.5rem)]">
            {isCommandPanelOpen ? (
              <div className="w-[360px] rounded-2xl border border-emerald-300/25 bg-slate-900/65 p-4 text-white shadow-2xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-wide">Smart Farm Control Panel</p>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-300" />
                    <button
                      type="button"
                      onClick={() => setIsCommandPanelOpen(false)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-slate-800/70"
                      aria-label="Collapse command panel"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-300">Crop</label>
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-slate-800/70 px-3 text-sm"
                    value={selectedCrop}
                    onChange={(event) => setSelectedCrop(event.target.value)}
                  >
                    {Object.entries(cropCatalog).map(([key, crop]) => (
                      <option key={key} value={key}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-300">Season</label>
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-slate-800/70 px-3 text-sm"
                    value={selectedSeason}
                    onChange={(event) => setSelectedSeason(event.target.value)}
                  >
                    <option value="kharif">Kharif</option>
                    <option value="rabi">Rabi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300">City</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-slate-800/70 px-3 text-sm"
                  value={selectedCity}
                  onChange={(event) => {
                    setSelectedCity(event.target.value);
                    setSelectedMandi(event.target.value);
                  }}
                >
                  {mandiOptions.map((market) => (
                    <option key={market} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-300">Mandi</label>
                <select
                  className="mt-1 h-10 w-full rounded-xl border border-white/20 bg-slate-800/70 px-3 text-sm"
                  value={selectedMandi}
                  onChange={(event) => setSelectedMandi(event.target.value)}
                >
                  {mandiOptions.map((market) => (
                    <option key={market} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-slate-300">Map layers</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLayer("moisture")}
                    className={`rounded-xl px-3 py-2 text-xs ${activeLayer === "moisture" ? "bg-cyan-500 text-white" : "bg-slate-700/80"}`}
                  >
                    Soil moisture
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLayer("suitability")}
                    className={`rounded-xl px-3 py-2 text-xs ${activeLayer === "suitability" ? "bg-lime-500 text-slate-900" : "bg-slate-700/80"}`}
                  >
                    Crop suitability
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLayer("profit")}
                    className={`rounded-xl px-3 py-2 text-xs ${activeLayer === "profit" ? "bg-emerald-500 text-white" : "bg-slate-700/80"}`}
                  >
                    Profit heatmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLayer("irrigation")}
                    className={`rounded-xl px-3 py-2 text-xs ${activeLayer === "irrigation" ? "bg-amber-500 text-slate-900" : "bg-slate-700/80"}`}
                  >
                    Irrigation status
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-slate-300">
                  <span>Prediction horizon</span>
                  <span>+{timeStep} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={timeStep}
                  onChange={(event) => setTimeStep(Number(event.target.value))}
                  className="w-full"
                />
              </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCommandPanelOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/25 bg-slate-900/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-100 shadow-2xl backdrop-blur-xl"
                aria-label="Open command panel"
              >
                <ChevronsRight className="h-4 w-4" />
                Open Control
              </button>
            )}
          </div>

          <div className="absolute right-3 top-3 z-20 w-[380px] max-w-[calc(100%-1.5rem)] rounded-2xl border border-emerald-300/20 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80">
            <p className="card-label">Zone smart card</p>
            <p className="mt-1 font-display text-xl font-semibold">{selectedZone?.zoneId || "Zone"}</p>
            <p className="mt-1 text-xs text-muted-foreground">City: {selectedCity} • Mandi: {selectedMandi}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-background/75 p-2">
                <p className="text-xs text-muted-foreground">Soil moisture</p>
                <p className="font-semibold">{selectedZone?.soilMoisture ?? 0}%</p>
              </div>
              <div className="rounded-xl bg-background/75 p-2">
                <p className="text-xs text-muted-foreground">Soil fertility</p>
                <p className="font-semibold">{selectedZone?.fertility ?? 0}/100</p>
              </div>
              <div className="rounded-xl bg-background/75 p-2">
                <p className="text-xs text-muted-foreground">Predicted yield</p>
                <p className="font-semibold">{(selectedZone?.predictedYield ?? 0).toLocaleString()} kg/ha</p>
              </div>
              <div className="rounded-xl bg-background/75 p-2">
                <p className="text-xs text-muted-foreground">Market price</p>
                <p className="font-semibold">{formatInr(selectedZone?.mandiPrice ?? 0)}/kg</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-background/70 p-3 text-sm">
              <div className="mb-1 flex items-center justify-between"><span>Total cost</span><span className="font-semibold">{formatInr(selectedZone?.totalCost ?? 0)}</span></div>
              <div className="mb-1 flex items-center justify-between"><span>Seed</span><span>{formatInr(selectedZone?.seedCost ?? 0)}</span></div>
              <div className="mb-1 flex items-center justify-between"><span>Fertilizer</span><span>{formatInr(selectedZone?.fertilizerCost ?? 0)}</span></div>
              <div className="mb-1 flex items-center justify-between"><span>Labor</span><span>{formatInr(selectedZone?.laborCost ?? 0)}</span></div>
              <div className="flex items-center justify-between"><span>Water</span><span>{formatInr(selectedZone?.waterCost ?? 0)}</span></div>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-background/70 p-3">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Estimated profit/loss</span>
                <span className={`font-semibold ${selectedZone?.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatInr(selectedZone?.profit ?? 0)}</span>
              </div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Market trend impact</span>
                <span>{selectedZone?.avgMarketTrend?.toFixed(1) || "0.0"}%</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">AI recommendation: {selectedZone?.recommendation || "-"}</div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-background/70 p-2 text-center">
                <Droplets className="mx-auto mb-1 h-3.5 w-3.5 text-cyan-500" />
                Live moisture
              </div>
              <div className="rounded-xl bg-background/70 p-2 text-center">
                <Leaf className="mx-auto mb-1 h-3.5 w-3.5 text-lime-500" />
                Suitability
              </div>
              <div className="rounded-xl bg-background/70 p-2 text-center">
                <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-500" />
                Profit score
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-amber-400/30 bg-amber-100/80 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
            <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Live simulation active • values refresh every 6s</div>
          </div>
        </div>
      </section>
    </div>
  );
}
