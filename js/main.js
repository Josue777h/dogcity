import { mixRgb, adjustRgb, rgbToHex, clampColor, $ } from './utils.js';
import { buildStoreApp } from './ui/store.js';
import { buildAdminApp } from './ui/admin.js';



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

  initNavToggle();
  
  const page = document.body.dataset.page || 'store';
  const app = page === 'admin' ? buildAdminApp() : buildStoreApp();
  
  app.init().catch(err => console.error('Error de inicialización:', err));
}

document.addEventListener('DOMContentLoaded', init);
