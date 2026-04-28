import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Creación de Icono Avanzado (Punto Limpio Estático)
const pulsingIcon = new L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px;">
           <div style="width:16px; height:16px; background:var(--primary-brand, #2563EB); border-radius:50%; border:3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.4);"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Componente para re-centrar el mapa agresivamente cuando cambia el estado nativo
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({ lat, lng, onLocationChange }) {
  const center = [lat, lng];
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onLocationChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <div className="w-full h-[220px] mt-4 mb-2 rounded-3xl overflow-hidden shadow-xl shadow-brand/10 border-4 border-white relative isolate bg-bg-alt flex items-center justify-center">
      {/* Isolate previene leaks de z-index de Leaflet por encima del Drawer/Modals */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={center} 
          zoom={16} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {/* Se usa light_all de CartoDB para un diseño flat ultra-minimalista premium (Apple/Uber style) */}
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={center}
            ref={markerRef}
            icon={pulsingIcon}
          />
          <MapUpdater center={center} />
        </MapContainer>
      </div>

      {/* Floating UX Hint (Glassmorphism) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-dark/80 backdrop-blur-xl px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl pointer-events-none z-[10] text-white border border-white/10 whitespace-nowrap">
         Ajusta el punto si no es exacto
      </div>
    </div>
  );
}
