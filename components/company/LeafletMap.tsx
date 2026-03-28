'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Next.js / Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type OfficeLocation = {
  id: number;
  latitude?: number | null;
  longitude?: number | null;
};

interface LeafletMapProps {
  offices: OfficeLocation[];
  editing: Record<string, unknown> | null;
  pos: [number, number] | null;
  setPos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

// Marker that listens to map clicks
function ClickMarker({
  position,
  onChange,
}: {
  position: LatLngExpression | null;
  onChange: (p: [number, number]) => void;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LeafletMap({
  offices,
  editing,
  pos,
  setPos,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={pos ?? [42.7, 23.3]}
      zoom={12}
      style={{ height: 400, width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {offices.map(
        (o) =>
          o.latitude &&
          o.longitude && (
            <Marker key={o.id} position={[o.latitude, o.longitude]} />
          ),
      )}
      {editing && <ClickMarker position={pos} onChange={setPos} />}
    </MapContainer>
  );
}
