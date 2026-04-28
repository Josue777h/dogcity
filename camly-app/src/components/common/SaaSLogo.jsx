import React from 'react';
import saasLogo from '../../assets/saas-logo.webp';

/**
 * SaaSLogo Component
 * Restaura el logotipo original (SVG con imagen base64) para mantener la fidelidad de marca.
 * Incluye optimizaciones de CSS para asegurar que se vea nítido y "pro".
 */
export default function SaaSLogo({ className = "h-10", withText = true, animated = true }) {
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* 
        Contenedor del Logo 
        Usamos el archivo original solicitado por el usuario para mantener el gradiente y forma exacta.
      */}
      <div className={`relative h-full aspect-square ${animated ? 'animate-float' : ''}`}>
        <img 
          src={saasLogo} 
          alt="CAMLY" 
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          fetchpriority="high"
        />
        
        {/* Efecto de resplandor premium */}
        <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Texto de Marca - Aseguramos que la fuente y estilo coincidan con el diseño original */}
      {withText && (
        <span className="text-2xl font-black tracking-tighter uppercase italic leading-none transition-all duration-500 group-hover:tracking-normal group-hover:text-brand">
          CAMLY
        </span>
      )}
    </div>
  );
}
