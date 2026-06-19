"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon paths in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Sub-component to sync map view when coordinates change from search/external input
function ChangeMapView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Sub-component to capture map click events
function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletMap({ lat, lng, onChange }: LeafletMapProps) {
  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10" style={{ position: 'relative' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={4}
        style={{ width: '100%', height: '100%', background: '#020617' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={[lat, lng]} draggable={true} eventHandlers={{
          dragend(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            onChange(position.lat, position.lng);
          }
        }} />
        <ChangeMapView lat={lat} lng={lng} />
        <MapEventsHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}
