import React from 'react';
import neguLogo from '../../assets/logo-trimmed.png';

/**
 * SaaSLogo Component — Negu
 * Renderiza el logotipo oficial de Negu con dimensionamiento optimizado.
 */
export default function SaaSLogo({ className = "h-10 sm:h-12", animated = true }) {
  const isDark = className.includes('text-white');

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className={`relative h-full flex items-center transition-transform duration-200 ${
        animated ? 'hover:scale-[1.03]' : ''
      } ${isDark ? 'bg-white px-3 py-1.5 rounded-xl shadow-xs' : ''}`}>
        <img 
          src={neguLogo} 
          alt="Negu" 
          className="block h-full w-auto max-h-full object-contain"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
