import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Pin idéntico al estilo Google Maps moderno
const googlePinIcon = new L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:36px; height:46px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.40)); cursor:pointer;">
           <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#EA4335"/>
             <circle cx="18" cy="18" r="8" fill="#FFFFFF"/>
             <circle cx="18" cy="18" r="4" fill="#B31412"/>
           </svg>
         </div>`,
  iconSize: [36, 46],
  iconAnchor: [18, 46]
});

// Componente para re-centrar el mapa y escuchar clics directos
function MapController({ center, onLocationChange }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [center, map]);

  useMapEvents({
    click(e) {
      if (onLocationChange && e.latlng) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
}

export default function LocationPickerMap({ lat, lng, onLocationChange, onGpsClick }) {
  const validLat = parseFloat(lat) || 7.89391;
  const validLng = parseFloat(lng) || -72.50782;
  const center = useMemo(() => [validLat, validLng], [validLat, validLng]);
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
    <div
      className="w-full h-[220px] sm:h-[240px] mt-2 mb-2 overflow-hidden relative isolate flex items-center justify-center"
      style={{
        backgroundColor: '#e5e3df',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={center} 
          zoom={16} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          {/* Capa oficial de Google Maps (sin API key requerida) */}
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={center}
            ref={markerRef}
            icon={googlePinIcon}
          />
          <MapController center={center} onLocationChange={onLocationChange} />
        </MapContainer>
      </div>

      {/* Botón flotante estilo Google Maps para auto-centrar GPS */}
      {onGpsClick && (
        <button
          type="button"
          onClick={onGpsClick}
          title="Centrar en mi ubicación actual"
          className="absolute top-3 right-3 p-2 rounded-full transition-transform active:scale-95 flex items-center justify-center z-[10]"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Navigation size={16} style={{ color: 'var(--color-brand)' }} />
        </button>
      )}

      {/* Floating UX Hint */}
      <div
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full pointer-events-none z-[10] text-white whitespace-nowrap"
        style={{
          backgroundColor: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        Toca el mapa o arrastra el pin
      </div>
    </div>
  );
}
