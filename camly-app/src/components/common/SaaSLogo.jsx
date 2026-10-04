import React from 'react';
import moveLogo from '../../assets/logo.png';

/**
 * SaaSLogo Component — Move
 * Renderiza el logotipo oficial Move.
 */
export default function SaaSLogo({ className = "h-8 sm:h-9", withText = true, animated = true }) {
  const isDark = className.includes('text-white');

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className={`relative h-full flex items-center transition-transform duration-200 ${
        animated ? 'hover:scale-[1.02]' : ''
      } ${isDark ? 'bg-white px-2 py-1 rounded-xl shadow-xs' : ''}`}>
        <img 
          src={moveLogo} 
          alt="Move" 
          className="h-full w-auto object-contain max-h-full block"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
