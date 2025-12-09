import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Locate, ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Provider } from "@/data/providers";
import type { Hospital } from "@/data/hospitals";
import type { Pharmacy } from "@/data/pharmacies";
import { cn } from "@/lib/utils";

interface MapViewProps {
  providers: Provider[];
  hospitals: Hospital[];
  pharmacies: Pharmacy[];
  selectedProviderId?: string;
  onProviderSelect?: (provider: Provider) => void;
  showPharmacies?: boolean;
  className?: string;
}

const STORAGE_KEY = "healthnav_mapbox_token";

export function MapView({
  providers,
  hospitals,
  pharmacies,
  selectedProviderId,
  onProviderSelect,
  showPharmacies = true,
  className,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapToken, setMapToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [tokenInput, setTokenInput] = useState(mapToken);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showPharmacyLayer, setShowPharmacyLayer] = useState(showPharmacies);

  const saveToken = () => {
    localStorage.setItem(STORAGE_KEY, tokenInput);
    setMapToken(tokenInput);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;

    mapboxgl.accessToken = mapToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-73.98, 40.76],
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

      map.current.on("load", () => {
        setIsMapReady(true);
      });

      return () => {
        map.current?.remove();
        setIsMapReady(false);
      };
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapToken("");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [mapToken]);

  // Add markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add provider markers (teal)
    providers.forEach((provider) => {
      const el = document.createElement("div");
      el.className = cn(
        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all",
        selectedProviderId === provider.id
          ? "bg-primary ring-4 ring-secondary shadow-lg scale-110"
          : "bg-primary hover:scale-110"
      );
      el.innerHTML = `<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`;
      el.style.color = "white";

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([provider.lng, provider.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div class="p-2">
              <p class="font-semibold">${provider.name}</p>
              <p class="text-xs text-gray-600">${provider.specialties[0]}</p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener("click", () => onProviderSelect?.(provider));
      markersRef.current.push(marker);
    });

    // Add hospital markers (indigo)
    hospitals.forEach((hospital) => {
      const el = document.createElement("div");
      el.className = "w-7 h-7 rounded-lg bg-secondary flex items-center justify-center";
      el.innerHTML = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([hospital.lng, hospital.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div class="p-2">
              <p class="font-semibold">${hospital.name}</p>
              <p class="text-xs text-gray-600">HCAHPS: ${hospital.hcahpsScore}</p>
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add pharmacy markers (gray) if enabled
    if (showPharmacyLayer) {
      pharmacies.forEach((pharmacy) => {
        const el = document.createElement("div");
        el.className = "w-6 h-6 rounded-full bg-neutral-500 flex items-center justify-center";
        el.innerHTML = `<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z"/></svg>`;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([pharmacy.lng, pharmacy.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
              <div class="p-2">
                <p class="font-semibold">${pharmacy.name}</p>
                <p class="text-xs text-gray-600">${pharmacy.hours}</p>
              </div>
            `)
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }
  }, [providers, hospitals, pharmacies, selectedProviderId, isMapReady, showPharmacyLayer, onProviderSelect]);

  // Center on selected provider
  useEffect(() => {
    if (!map.current || !isMapReady || !selectedProviderId) return;

    const provider = providers.find((p) => p.id === selectedProviderId);
    if (provider) {
      map.current.flyTo({
        center: [provider.lng, provider.lat],
        zoom: 14,
        duration: 500,
      });
    }
  }, [selectedProviderId, providers, isMapReady]);

  const handleFitToResults = () => {
    if (!map.current || providers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    providers.forEach((p) => bounds.extend([p.lng, p.lat]));
    map.current.fitBounds(bounds, { padding: 50 });
  };

  const handleLocate = () => {
    if (!map.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 13,
        });
      },
      () => alert("Could not get your location")
    );
  };

  // Token input UI
  if (!mapToken) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8", className)}>
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Connect Mapbox</h3>
          <p className="text-sm text-muted-foreground">
            Enter your Mapbox public token to enable the map. Get one free at{" "}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token" className="sr-only">Mapbox Token</Label>
            <Input
              id="mapbox-token"
              placeholder="pk.eyJ1Ijo..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <Button onClick={saveToken} disabled={!tokenInput} className="w-full">
              Connect Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="shadow-md" onClick={handleLocate}>
          <Locate className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="shadow-md" onClick={handleFitToResults}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={showPharmacyLayer ? "default" : "secondary"}
          className="shadow-md"
          onClick={() => setShowPharmacyLayer(!showPharmacyLayer)}
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg p-3 shadow-md text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span>Providers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-secondary" />
          <span>Hospitals</span>
        </div>
        {showPharmacyLayer && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-neutral-500" />
            <span>Pharmacies</span>
          </div>
        )}
      </div>
    </div>
  );
}
