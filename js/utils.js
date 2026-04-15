import { DEFAULT_IMAGE, PLACEHOLDER_IMAGES } from './constants.js';

export function $(id) {
  return document.getElementById(id);
}

export function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

export function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function rgbToHex(r, g, b) {
  const toHex = channel => clampColor(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function adjustRgb([r, g, b], amount) {
  return [clampColor(r + amount), clampColor(g + amount), clampColor(b + amount)];
}

export function mixRgb(source, target, ratio = 0.5) {
  const [sr, sg, sb] = source;
  const [tr, tg, tb] = target;
  return [
    clampColor(sr * (1 - ratio) + tr * ratio),
    clampColor(sg * (1 - ratio) + tg * ratio),
    clampColor(sb * (1 - ratio) + tb * ratio)
  ];
}

export function pickPlaceholderImage(seed = 0) {
  const index = Math.abs(Number(seed) || 0) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
}

export function resolveProductImage(product, seed = 0) {
  const image = String(product?.image || '').trim();
  if (image && image !== DEFAULT_IMAGE) {
    return image;
  }
  return pickPlaceholderImage(seed || product?.id || product?.name?.length || 0);
}

export function sanitizeFileName(value) {
  return String(value || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'producto';
}

export function getFileExtension(file) {
  const fromName = String(file?.name || '').split('.').pop()?.toLowerCase();
  if (fromName && fromName !== String(file?.name || '').toLowerCase()) {
    return fromName;
  }

  const mimeType = String(file?.type || '').toLowerCase();
  if (mimeType.includes('png')) {
    return 'png';
  }
  if (mimeType.includes('webp')) {
    return 'webp';
  }
  return 'jpg';
}

export function playNewOrderSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
    
    const osc2 = audioContext.createOscillator();
    osc2.connect(gainNode);
    osc2.frequency.setValueAtTime(1000, now + 0.15);
    gainNode.gain.setValueAtTime(0.3, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.25);
  } catch (error) {
    console.warn('No se pudo reproducir sonido:', error);
  }
}
