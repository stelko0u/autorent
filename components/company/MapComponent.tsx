'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

type OfficeItem = {
  id?: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

interface MapComponentProps {
  offices: Array<OfficeItem & { id: number }>;
  editing: OfficeItem | null;
  pos: [number, number] | null;
  setPos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  companyColors: Record<number, string>;
}

interface LocationPickerProps {
  editing: OfficeItem | null;
  setPos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

function LocationPicker({ editing, setPos }: LocationPickerProps) {
  useMapEvents({
    click(event) {
      if (!editing) {
        return;
      }

      setPos([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function createOfficeIcon(color: string) {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
        <div style="
          width:18px;
          height:18px;
          border-radius:9999px;
          background:${color};
          border:3px solid white;
          box-shadow:0 6px 18px rgba(0,0,0,0.18);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createEditingIcon() {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
        <div style="
          width:20px;
          height:20px;
          border-radius:9999px;
          background:#4f46e5;
          border:4px solid white;
          box-shadow:0 8px 20px rgba(79,70,229,0.35);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function MapComponent({
  offices,
  editing,
  pos,
  setPos,
  companyColors,
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (pos) {
      return pos;
    }

    const firstOffice = offices.find(
      (office) => office.latitude != null && office.longitude != null,
    );

    if (firstOffice?.latitude != null && firstOffice.longitude != null) {
      return [firstOffice.latitude, firstOffice.longitude];
    }

    return [42.6977, 23.3219];
  }, [offices, pos]);

  if (!mounted) {
    return (
      <div className="flex h-[420px] items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading map…
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationPicker editing={editing} setPos={setPos} />

        {offices.map((office) => {
          if (office.latitude == null || office.longitude == null) {
            return null;
          }

          const color = companyColors[office.id] ?? '#6366f1';

          return (
            <Marker
              key={office.id}
              position={[office.latitude, office.longitude]}
              icon={createOfficeIcon(color)}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <div className="font-semibold text-gray-900">
                    {office.name || `Office #${office.id}`}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {office.address || 'No address'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {editing && pos ? (
          <Marker position={pos} icon={createEditingIcon()}>
            <Popup>
              <div className="text-sm font-medium text-gray-900">
                Selected office location
              </div>
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
