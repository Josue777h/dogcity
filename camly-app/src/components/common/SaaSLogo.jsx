import React from 'react';
import neguLogo from '../../assets/logo.png';

/**
 * SaaSLogo Component — Negu
 * Renderiza el logotipo oficial de Negu con dimensionamiento optimizado.
 */
export default function SaaSLogo({ className = "h-10 sm:h-12", withText = true, animated = true }) {
  const isDark = className.includes('text-white');

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className={`relative h-full flex items-center transition-transform duration-200 ${
        animated ? 'hover:scale-[1.03]' : ''
      } ${isDark ? 'bg-white px-3 py-1.5 rounded-xl shadow-xs' : ''}`}>
        <img 
          src={neguLogo} 
          alt="Negu" 
          className="h-full w-auto object-contain max-h-full block transform scale-110 sm:scale-125 origin-left"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
