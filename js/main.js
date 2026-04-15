import { mixRgb, adjustRgb, rgbToHex, clampColor, $ } from './utils.js';
import { buildStoreApp } from './ui/store.js';
import { buildAdminApp } from './ui/admin.js';

function applyBrandPaletteFromLogo() {
  const logo = document.querySelector('.brand-mark img');
  if (!logo) return;

  const setPalette = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      const size = 28;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(logo, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;

      let r = 0, g = 0, b = 0, samples = 0;
      let redR = 0, redG = 0, redB = 0, redSamples = 0;
      let yellowR = 0, yellowG = 0, yellowB = 0, yellowSamples = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < 80) continue;
        const pr = pixels[i], pg = pixels[i + 1], pb = pixels[i + 2];

        r += pr; g += pg; b += pb; samples += 1;

        const isRed = pr > 150 && pg < 125 && pb < 125;
        const isYellow = pr > 160 && pg > 140 && pb < 130;
        if (isRed) { redR += pr; redG += pg; redB += pb; redSamples += 1; }
        if (isYellow) { yellowR += pr; yellowG += pg; yellowB += pb; yellowSamples += 1; }
      }

      if (!samples) return;

      const base = [r / samples, g / samples, b / samples];
      const primary = redSamples ? [redR / redSamples, redG / redSamples, redB / redSamples] : base;
      const secondary = yellowSamples ? [yellowR / yellowSamples, yellowG / yellowSamples, yellowB / yellowSamples] : adjustRgb(base, 32);
      
      const dark = adjustRgb(primary, -24);
      const soft = adjustRgb(primary, 150);
      const muted = mixRgb(primary, [40, 12, 16], 0.55);

      const background = mixRgb(secondary, [255, 255, 255], 0.78);
      const softSurface = mixRgb(secondary, [255, 255, 255], 0.86);
      const border = mixRgb(secondary, [255, 255, 255], 0.48);

      const root = document.documentElement.style;
      
      // Colores de marca dinámicos
      root.setProperty('--primary', rgbToHex(...primary));
      root.setProperty('--primary-dark', rgbToHex(...dark));
      root.setProperty('--primary-soft', rgbToHex(...soft));
      root.setProperty('--secondary', rgbToHex(...secondary));
      root.setProperty('--muted-brand', rgbToHex(...muted));
      root.setProperty('--ring', `rgba(${clampColor(primary[0])}, ${clampColor(primary[1])}, ${clampColor(primary[2])}, 0.22)`);

      // Siempre aplicar fondo/superficie claros (Modo Oscuro eliminado)
      root.setProperty('--bg', rgbToHex(...background));
      root.setProperty('--surface-soft', rgbToHex(...softSurface));
      root.setProperty('--border', rgbToHex(...border));
      
    } catch (error) {
      console.warn('Error al aplicar paleta:', error);
    }
  };

  if (logo.complete) setPalette();
  else logo.addEventListener('load', setPalette, { once: true });
}

function initNavToggle() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 780) closeMenu(); });
}

function init() {
  applyBrandPaletteFromLogo();
  initNavToggle();
  
  const page = document.body.dataset.page || 'store';
  const app = page === 'admin' ? buildAdminApp() : buildStoreApp();
  
  app.init().catch(err => console.error('Error de inicialización:', err));
}

document.addEventListener('DOMContentLoaded', init);
