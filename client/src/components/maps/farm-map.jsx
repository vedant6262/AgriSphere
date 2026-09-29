import { useEffect, useRef } from "react";
import { Layers, LocateFixed, MapPin } from "lucide-react";
import { MapCard } from "@/components/saas/map-card";
import { useTheme } from "@/context/theme-context";

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export function FarmMap({ settings, weather }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const { theme } = useTheme();
  const mapStyle = theme === "dark" ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/satellite-streets-v12";

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || mapRef.current) {
      return undefined;
    }

    let isCancelled = false;

    import("mapbox-gl").then((module) => {
      if (isCancelled) return;
      const mapboxgl = module.default;
      mapboxgl.accessToken = mapboxToken;

      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: mapStyle,
        center: [settings.longitude, settings.latitude],
        zoom: 11
      });

      new mapboxgl.Marker({ color: "#16A34A" })
        .setLngLat([settings.longitude, settings.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${settings.farmName || "Farm"}</strong><br/>${weather?.current?.summary || "Weather overlay"}`
          )
        )
        .addTo(mapRef.current);
    });

    return () => {
      isCancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapStyle, settings.farmName, settings.latitude, settings.longitude, weather?.current?.summary]);

  return (
    <MapCard
      id="farm-map"
      title="Farm Map"
      description="Mapbox farm location with current weather context."
      overlay={
        <div className="rounded-2xl border border-white/35 bg-white/75 p-3 shadow-soft backdrop-blur-xl dark:border-white/20 dark:bg-slate-900/70">
          <p className="card-label">Live conditions</p>
          <p className="mt-2 font-semibold">{settings.farmName || "Farm location"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{weather?.current?.summary || "Weather context unavailable"}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Temp</span>
            <span className="text-right">{weather?.current?.temperature ?? "--"}C</span>
            <span>Wind</span>
            <span className="text-right">{weather?.current?.windSpeed ?? "--"} km/h</span>
          </div>
        </div>
      }
    >
        {mapboxToken ? (
          <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
              <button type="button" className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/45 bg-white/80 text-foreground shadow dark:border-white/20 dark:bg-slate-900/75">
                <LocateFixed className="h-4 w-4" />
              </button>
              <button type="button" className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/45 bg-white/80 text-foreground shadow dark:border-white/20 dark:bg-slate-900/75">
                <Layers className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 text-center">
            <MapPin className="mb-3 h-10 w-10 text-primary" />
            <p className="font-display text-xl font-semibold">{settings.location}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Live map integration is disabled in this setup. Climate and farm decisions continue to work using weather data.
            </p>
          </div>
        )}
    </MapCard>
  );
}
