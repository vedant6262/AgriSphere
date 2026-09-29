import { useEffect, useState } from "react";
import { MapPinned, LocateFixed, Save, Settings2, UserRound, Wheat } from "lucide-react";
import { NotificationToast } from "@/components/saas/notification-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppAuth } from "@/context/auth-context";
import { settingsApi } from "@/services/api";

const maybeNumber = (value) => (value === "" || value == null ? undefined : Number(value));

const buildLocationLabel = (address = {}) => {
  const place = address.city || address.town || address.village || address.hamlet || address.suburb || address.county || address.state_district || address.state;
  const region = address.state || address.country;

  if (place && region && place !== region) {
    return `${place}, ${region}`;
  }

  return place || region || "Current location";
};

export function SettingsPage() {
  const { getToken } = useAppAuth();
  const [form, setForm] = useState({
    farmName: "",
    farmerName: "",
    location: "",
    latitude: "",
    longitude: "",
    cropType: "",
    region: "",
    season: "",
    farmSizeAcres: "",
    irrigationMethod: "",
    preferredLanguage: "",
    phoneNumber: "",
    soilType: "",
    useCurrentLocation: false,
    tempLowThreshold: "",
    tempHighThreshold: "",
    sensorChannelId: "",
    sensorFieldSoil: "",
    sensorFieldHum: "",
    sensorFieldTemp: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    settingsApi.get(getToken).then((response) => {
      setForm((current) => ({
        ...current,
        useCurrentLocation: Boolean(response.settings.useCurrentLocation)
      }));
    });
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Current location is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        let locationLabel = "Current location";

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            locationLabel = data?.display_name ? buildLocationLabel(data.address) : locationLabel;
          }
        } catch {
          locationLabel = "Current location";
        }

        setForm((current) => ({
          ...current,
          latitude,
          longitude,
          location: locationLabel,
          useCurrentLocation: true
        }));
        setLocationStatus(`${locationLabel} added.`);
        setIsLocating(false);
      },
      (error) => {
        setLocationStatus(error?.message || "Unable to detect current location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        farmName: form.farmName.trim(),
        farmerName: form.farmerName.trim(),
        location: form.location.trim(),
        cropType: form.cropType.trim(),
        region: form.region.trim(),
        season: form.season.trim(),
        irrigationMethod: form.irrigationMethod.trim(),
        preferredLanguage: form.preferredLanguage.trim(),
        phoneNumber: form.phoneNumber.trim(),
        soilType: form.soilType.trim(),
        sensorChannelId: form.sensorChannelId.trim(),
        latitude: maybeNumber(form.latitude),
        longitude: maybeNumber(form.longitude),
        farmSizeAcres: maybeNumber(form.farmSizeAcres),
        tempLowThreshold: maybeNumber(form.tempLowThreshold),
        tempHighThreshold: maybeNumber(form.tempHighThreshold),
        useCurrentLocation: Boolean(form.useCurrentLocation)
      };
      await settingsApi.update(payload, getToken);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <NotificationToast show={showToast} title="Settings updated" description="Your farm profile and sensor mapping were saved." />
      <div>
        <p className="card-label text-primary">Settings</p>
        <h2 className="page-title mt-2">Configure farm profile and platform preferences</h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <Card>
        <CardHeader>
          <div>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure farm location, crop profile, and sensor mapping.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.75rem] bg-secondary/90 p-5 text-secondary-foreground">
            <Settings2 className="mb-3 h-6 w-6" />
            <p className="font-display text-2xl font-semibold">Platform configuration</p>
            <p className="mt-2 text-sm opacity-90">
              These values drive dashboard forecasts, map focus, and recommendation logic.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-background/60 p-5">
            <MapPinned className="mb-3 h-6 w-6 text-primary" />
            <p className="font-medium">{form.location || "Farm location pending"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your exact coordinates or use current location to improve weather and map accuracy.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={isLocating}>
                <LocateFixed className="mr-2 h-4 w-4" />
                {isLocating ? "Detecting..." : "Use current location"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm((current) => ({ ...current, useCurrentLocation: false }))}
              >
                Manual location
              </Button>
            </div>
            {locationStatus ? <p className="mt-3 text-xs text-muted-foreground">{locationStatus}</p> : null}
          </div>
        </CardContent>
      </Card>

        <Card>
        <CardHeader>
          <div>
            <CardTitle>Farm Profile</CardTitle>
            <CardDescription>Keep your crop, region, and sensor channel up to date.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2 grid gap-3 rounded-[1.5rem] border border-border bg-background/55 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Farmer identity</p>
                <p className="text-sm text-muted-foreground">Store the details used across alerts, community posts, and recommendations.</p>
              </div>
            </div>

            <Input placeholder="Farmer name" value={form.farmerName || ""} onChange={(event) => setForm({ ...form, farmerName: event.target.value })} />
            <Input placeholder="Farm name" value={form.farmName || ""} onChange={(event) => setForm({ ...form, farmName: event.target.value })} />
            <Input placeholder="Phone number" value={form.phoneNumber || ""} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            <Input placeholder="Preferred language" value={form.preferredLanguage || ""} onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })} />

            <div className="md:col-span-2 grid gap-3 rounded-[1.5rem] border border-border bg-background/55 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Farm profile</p>
                <p className="text-sm text-muted-foreground">Use these fields to tailor crop advice and irrigation suggestions.</p>
              </div>
            </div>

            <Input placeholder="Location" value={form.location || ""} onChange={(event) => setForm({ ...form, location: event.target.value, useCurrentLocation: false })} />
            <Input placeholder="Latitude" type="number" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} />
            <Input placeholder="Longitude" type="number" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} />
            <Input placeholder="Crop type" value={form.cropType || ""} onChange={(event) => setForm({ ...form, cropType: event.target.value })} />
            <Input placeholder="Region" value={form.region || ""} onChange={(event) => setForm({ ...form, region: event.target.value })} />
            <Input placeholder="Season" value={form.season || ""} onChange={(event) => setForm({ ...form, season: event.target.value })} />
            <Input placeholder="Farm size (acres)" type="number" step="0.1" value={form.farmSizeAcres ?? ""} onChange={(event) => setForm({ ...form, farmSizeAcres: event.target.value })} />
            <Input placeholder="Irrigation method" value={form.irrigationMethod || ""} onChange={(event) => setForm({ ...form, irrigationMethod: event.target.value })} />
            <Input placeholder="Soil type" value={form.soilType || ""} onChange={(event) => setForm({ ...form, soilType: event.target.value })} />
            <Input
              placeholder="Low temperature alert threshold (C)"
              type="number"
              value={form.tempLowThreshold ?? ""}
              onChange={(event) => setForm({ ...form, tempLowThreshold: Number(event.target.value) })}
            />
            <Input
              placeholder="High temperature alert threshold (C)"
              type="number"
              value={form.tempHighThreshold ?? ""}
              onChange={(event) => setForm({ ...form, tempHighThreshold: Number(event.target.value) })}
            />
            <Input placeholder="ThingSpeak channel ID" value={form.sensorChannelId || ""} onChange={(event) => setForm({ ...form, sensorChannelId: event.target.value })} />
            <Input placeholder="Soil field number" type="number" value={form.sensorFieldSoil || ""} onChange={(event) => setForm({ ...form, sensorFieldSoil: Number(event.target.value) })} />
            <Input placeholder="Humidity field number" type="number" value={form.sensorFieldHum || ""} onChange={(event) => setForm({ ...form, sensorFieldHum: Number(event.target.value) })} />
            <Input placeholder="Temperature field number" type="number" value={form.sensorFieldTemp || ""} onChange={(event) => setForm({ ...form, sensorFieldTemp: Number(event.target.value) })} />
            <label className="md:col-span-2 flex items-center gap-3 rounded-[1.25rem] border border-border bg-background/60 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.useCurrentLocation)}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setForm((current) => ({
                    ...current,
                    useCurrentLocation: checked
                  }));

                  if (checked && !form.latitude && !form.longitude) {
                    handleUseCurrentLocation();
                  }
                }}
              />
              Use my current location for farm maps and weather when available.
            </label>
            <div className="md:col-span-2">
              <Button disabled={isSaving} type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
