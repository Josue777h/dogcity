import { useEffect, useRef } from 'react';

/**
 * Campo vectorial interactivo de precisión (estilo Antigravity).
 * - Movimiento autónomo fluido con doble corriente armónica (siempre vivo en móvil y PC).
 * - Reacción magnética con velocidad de cursor/dedo (estela luminosa direccional).
 * - Onda expansiva radial al tocar o hacer clic.
 * - Pausa automática fuera de pantalla (IntersectionObserver) para 60fps constantes.
 */
export default function InteractiveHeroCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cells = [];
    let ripples = [];
    let rafId = 0;
    let isVisible = true;

    // Puntero con inercia y vector de velocidad para estela direccional
    const pointer = {
      targetX: -9999,
      targetY: -9999,
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
      strength: 0,
      active: false,
    };

    const initField = () => {
      let spacing = 32;
      if (width < 480) spacing = 25;
      else if (width < 768) spacing = 28;
      else if (width >= 1600) spacing = 38;

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) * 0.5;
      const offsetY = (height - (rows - 1) * spacing) * 0.5;

      const next = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing;
          const y = offsetY + r * spacing;
          next.push({
            x,
            y,
            nx: width > 0 ? x / width : 0,
            ny: height > 0 ? y / height : 0,
            phase: c * 0.28 + r * 0.21,
          });
        }
      }
      cells = next;
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initField();
    };

    const updatePointer = (clientX, clientY) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        if (!pointer.active) {
          pointer.x = x;
          pointer.y = y;
        }
        pointer.targetX = x;
        pointer.targetY = y;
        pointer.active = true;
      } else {
        pointer.active = false;
      }
    };

    const spawnRipple = (clientX, clientY) => {
      if (reducedMotion || !isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        ripples.push({ x, y, born: performance.now() });
        if (ripples.length > 4) ripples.shift();
      }
    };

    const onPointerMove = (e) => updatePointer(e.clientX, e.clientY);
    const onPointerDown = (e) => {
      updatePointer(e.clientX, e.clientY);
      spawnRipple(e.clientX, e.clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches?.[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          ([entry]) => {
            isVisible = Boolean(entry?.isIntersecting);
            if (!isVisible) pointer.active = false;
          },
          { threshold: 0.01 }
        )
      : null;
    if (io && canvas.parentElement) io.observe(canvas.parentElement);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('touchend', onPointerLeave, { passive: true });

    const render = (now) => {
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);
      const t = reducedMotion ? 1.4 : now * 0.001;

      // Inercia física y cálculo de velocidad del puntero
      if (pointer.active) {
        const nextX = pointer.x + (pointer.targetX - pointer.x) * 0.18;
        const nextY = pointer.y + (pointer.targetY - pointer.y) * 0.18;
        pointer.vx = pointer.vx * 0.72 + (nextX - pointer.x) * 0.28;
        pointer.vy = pointer.vy * 0.72 + (nextY - pointer.y) * 0.28;
        pointer.x = nextX;
        pointer.y = nextY;
        pointer.speed = Math.min(1, Math.hypot(pointer.vx, pointer.vy) / 16);
        pointer.strength += (1 - pointer.strength) * 0.15;
      } else {
        pointer.vx *= 0.88;
        pointer.vy *= 0.88;
        pointer.speed *= 0.9;
        pointer.strength *= 0.93;
      }

      // Dos focos autónomos fluidos para que el fondo se sienta vivo incluso sin mover el cursor
      const orb1X = width * (0.5 + 0.38 * Math.sin(t * 0.58));
      const orb1Y = height * (0.48 + 0.30 * Math.cos(t * 0.44));
      const orb2X = width * (0.5 + 0.36 * Math.cos(t * 0.41 + 1.8));
      const orb2Y = height * (0.52 + 0.28 * Math.sin(t * 0.53 + 0.9));

      const influenceRadius = width < 640 ? 170 : 250;
      const orbRadius = width < 640 ? 190 : 300;
      const pointerAngle = Math.atan2(pointer.vy, pointer.vx);

      const rippleDuration = 1350;
      ripples = ripples.filter((rp) => now - rp.born < rippleDuration);

      ctx.lineCap = 'round';
      const baseLen = width < 640 ? 5.6 : 7.0;
      const baseWidth = width < 640 ? 1.4 : 1.55;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // Doble corriente armónica viajera (movimiento constante y elegante)
        const wave1 = Math.sin(cell.nx * 5.8 - t * 1.45 + Math.cos(cell.ny * 4.2 + t * 0.95));
        const wave2 = Math.cos(cell.nx * 3.4 + cell.ny * 5.1 - t * 1.15);
        const combinedWave = wave1 * 0.62 + wave2 * 0.38;

        let angle = combinedWave * 1.05 + Math.sin(cell.phase + t * 0.9) * 0.3;
        let energy = Math.max(0, (combinedWave + 0.75) * 0.24); // flujo base visible y limpio
        let displaceX = Math.cos(angle) * combinedWave * 2.2;
        let displaceY = Math.sin(angle) * combinedWave * 2.2;

        // Interacción con los 2 focos autónomos (suave y continua)
        const d1x = cell.x - orb1X;
        const d1y = cell.y - orb1Y;
        const dist1 = Math.hypot(d1x, d1y);
        if (dist1 < orbRadius) {
          const f1 = 1 - dist1 / orbRadius;
          const pull1 = f1 * f1 * (1 - pointer.strength * 0.45);
          const swirl1 = Math.atan2(d1y, d1x) + Math.PI * 0.45;
          angle += (swirl1 - angle) * pull1 * 0.52;
          energy += pull1 * 0.46;
        }

        const d2x = cell.x - orb2X;
        const d2y = cell.y - orb2Y;
        const dist2 = Math.hypot(d2x, d2y);
        if (dist2 < orbRadius * 0.85) {
          const f2 = 1 - dist2 / (orbRadius * 0.85);
          const pull2 = f2 * f2 * (1 - pointer.strength * 0.45);
          const swirl2 = Math.atan2(d2y, d2x) - Math.PI * 0.45;
          angle += (swirl2 - angle) * pull2 * 0.42;
          energy += pull2 * 0.36;
        }

        // Interacción magnética pro con el cursor o dedo (con estela según velocidad)
        if (pointer.strength > 0.01) {
          const dx = cell.x - pointer.x;
          const dy = cell.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < influenceRadius && dist > 0.5) {
            const norm = 1 - dist / influenceRadius;
            const eased = norm * norm * pointer.strength;
            const radialAngle = Math.atan2(dy, dx);

            // Mezcla alineación radial + dirección de arrastre del cursor
            const blendedAngle = pointer.speed > 0.08
              ? radialAngle + Math.sin(pointerAngle - radialAngle) * (0.65 * pointer.speed)
              : radialAngle + Math.sin(norm * Math.PI) * 0.45;

            angle = blendedAngle;
            energy += eased * (0.92 + pointer.speed * 0.35);

            const push = eased * (width < 640 ? 9 : 14);
            displaceX += (dx / dist) * push + pointer.vx * eased * 0.55;
            displaceY += (dy / dist) * push + pointer.vy * eased * 0.55;
          }
        }

        // Onda expansiva radial al clic o toque
        for (let r = 0; r < ripples.length; r++) {
          const rp = ripples[r];
          const progress = (now - rp.born) / rippleDuration;
          const ringRadius = progress * Math.max(width, height) * 0.78;
          const rdist = Math.hypot(cell.x - rp.x, cell.y - rp.y);
          const band = Math.abs(rdist - ringRadius);
          if (band < 54) {
            const ringEnergy = (1 - band / 54) * (1 - progress);
            energy += ringEnergy * 0.85;
            angle += ringEnergy * 0.75;
          }
        }

        // Atenuación limpia hacia los bordes para fundirse con #070B14
        const edgeX = Math.min(cell.nx, 1 - cell.nx) * 4.5;
        const edgeY = Math.min(cell.ny, 1 - cell.ny) * 3.6;
        const edgeMask = Math.min(1, edgeX, edgeY);
        if (edgeMask <= 0.02) continue;

        const clampedEnergy = Math.min(1, energy);
        const len = baseLen + clampedEnergy * 7.8;
        const half = len * 0.5;
        const cx = cell.x + displaceX;
        const cy = cell.y + displaceY;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Paleta precisa: slate -> azul sky luminoso -> destello hielo en energía alta
        let rCol = 100;
        let gCol = 116;
        let bCol = 139;
        if (clampedEnergy > 0.2) {
          const k = Math.min(1, (clampedEnergy - 0.2) / 0.8);
          rCol = Math.round(100 + (56 - 100) * k + (k > 0.68 ? (k - 0.68) * 460 : 0));
          gCol = Math.round(116 + (189 - 116) * k + (k > 0.68 ? (k - 0.68) * 200 : 0));
          bCol = Math.round(139 + (248 - 139) * k);
        }
        const alpha = Math.min(0.94, (0.16 + clampedEnergy * 0.76) * edgeMask);

        ctx.strokeStyle = `rgba(${Math.min(255, rCol)}, ${Math.min(255, gCol)}, ${Math.min(255, bCol)}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = baseWidth + clampedEnergy * 0.75;
        ctx.beginPath();
        ctx.moveTo(cx - cos * half, cy - sin * half);
        ctx.lineTo(cx + cos * half, cy + sin * half);
        ctx.stroke();
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('touchend', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`}
    />
  );
}
