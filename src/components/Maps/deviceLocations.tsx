// components/maps/device-locations-map.tsx
"use client";

import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useSensorStore } from "@/services/store";
import { cn } from "@/lib/utils";

type Location = {
  device: string;
  lat: number;
  lng: number;
};

interface DeviceLocationsMapProps {
  locations: Location[];
  className?: string;
}

const CORAL_GABLES = { lat: 25.7215, lng: -80.2684 };
const ZOOM = 4;

const darkStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6bb367" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

export function DeviceLocationsMap({ locations, className }: DeviceLocationsMapProps) {
  // Fixed: Use NEXT_PUBLIC_ + no libraries + stable ID
  const { isLoaded } = useJsApiLoader({
     id: "google-map-script", 
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
   
    // No libraries → you're not using Places API
  });

  const { rawData } = useSensorStore();
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);

  const latestData = useMemo(() => {
    const batVData = rawData.batV || [];
    const iaqData = rawData.iaq_2 || [];
    const solPData = rawData.solP || [];
    const co2Data = rawData.co2_2 || [];

    const latestBatV = batVData.at(-1);
    const latestAQI = iaqData.at(-1);
    const latestPowerGen = solPData.at(-1);
    const latestCO2 = co2Data.at(-1);

    const lastSeen = latestBatV ? format(new Date(latestBatV.x), 'PPP p') : 'N/A';

    return {
      batV: latestBatV?.y || 0,
      aqi: latestAQI?.y || 0,
      powerGen: latestPowerGen?.y || 0,
      co2: latestCO2?.y || 0,
      lastSeen,
    };
  }, [rawData]);

  const center = useMemo(() => {
    if (locations.length === 0) return CORAL_GABLES;
    const avg = locations.reduce(
      (acc, loc) => ({ lat: acc.lat + loc.lat, lng: acc.lng + loc.lng }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: avg.lat / locations.length,
      lng: avg.lng / locations.length,
    };
  }, [locations]);

  if (!isLoaded) {
    return (
      <div className={cn("h-96 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800", className)} />
    );
  }

  const getAQIColor = (aqi: number) =>
    aqi < 50 ? "text-green-600" : aqi < 100 ? "text-yellow-600" : "text-red-600";
  const getCO2Color = (co2: number) =>
    co2 < 1000 ? "text-green-600" : co2 < 2000 ? "text-yellow-600" : "text-red-600";

  return (
    <GoogleMap
      mapContainerClassName={cn("rounded-lg", className)}
      mapContainerStyle={{ width: "100%", height: "400px" }}
      center={center}
      zoom={locations.length === 1 ? 15 : ZOOM}
      options={{
        styles: darkStyle,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {locations.map((loc) => {
        const isHovered = selectedMarker?.device === loc.device;

        return (
          <MarkerF
            key={loc.device}
            position={{ lat: loc.lat, lng: loc.lng }}
            onMouseOver={() => setSelectedMarker(loc)}
            onMouseOut={() => setSelectedMarker(null)}
            title={loc.device}
            label={{
              text: loc.device,
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {isHovered && (
              <InfoWindowF
                position={{ lat: loc.lat, lng: loc.lng }}
                options={{ pixelOffset: new google.maps.Size(0, -10) }}
              >
                <div className="max-w-xs rounded bg-white p-3 text-sm shadow-lg">
                  <h4 className="mb-1 font-bold text-gray-900">{loc.device}</h4>
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Last Seen: </span>
                    {latestData.lastSeen}
                  </p>
                  <p className="mb-1 flex items-center">
                    <span className="mr-2">Battery Voltage: </span>
                    <strong>{latestData.batV.toFixed(2)} V</strong>
                  </p>
                  <p className={`mb-1 flex items-center ${getAQIColor(latestData.aqi)}`}>
                    <span className="mr-2">AQI: </span>
                    <strong>{latestData.aqi}</strong>
                  </p>
                  <p className="mb-1 flex items-center">
                    <span className="mr-2">Power Gen: </span>
                    <strong>{latestData.powerGen.toFixed(2)} kW</strong>
                  </p>
                  <p className={`flex items-center ${getCO2Color(latestData.co2)}`}>
                    <span className="mr-2">CO₂: </span>
                    <strong>{latestData.co2} ppm</strong>
                  </p>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}

      {locations.length === 0 && (
        <MarkerF
          position={CORAL_GABLES}
          title="Coral Gables, FL"
          label={{
            text: "Coral Gables",
            color: "#10B981",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        />
      )}
    </GoogleMap>
  );
}