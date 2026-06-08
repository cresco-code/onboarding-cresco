/**
 * Confetti sutil, on-brand — para celebrar al completar una sección del onboarding.
 * Sin dependencias, canvas que se limpia solo. Respeta prefers-reduced-motion.
 */
const BRAND = ['#3D5240', '#7E9A80', '#C9602E', '#E0A52E', '#EFEAE0']; // moss · moss-lt · clay · gold · lino

interface Part {
  x: number; y: number; vx: number; vy: number; g: number;
  w: number; h: number; rot: number; vr: number; color: string;
  life: number; max: number;
}

export function fireConfetti(opts: { x?: number; y?: number; color?: string } = {}): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const x = opts.x ?? window.innerWidth / 2;
  const y = opts.y ?? window.innerHeight * 0.34;
  // tinta hacia el color de la fase + acentos cálidos de la marca
  const colors = opts.color
    ? [opts.color, opts.color, '#E0A52E', '#EFEAE0', '#7E9A80']
    : BRAND;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  ctx.scale(dpr, dpr);

  const N = 44; // sutil, pero con cuerpo
  const parts: Part[] = Array.from({ length: N }, (_, i) => {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.9; // abanico hacia arriba
    const sp = 3.4 + Math.random() * 6;
    return {
      x, y,
      vx: Math.cos(ang) * sp + (Math.random() - 0.5) * 1.5,
      vy: Math.sin(ang) * sp - Math.random() * 2,
      g: 0.12 + Math.random() * 0.06,
      w: 4 + Math.random() * 3,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.26,
      color: colors[i % colors.length],
      life: 0,
      max: 58 + Math.random() * 32,
    };
  });

  let raf = 0;
  const tick = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = false;
    for (const p of parts) {
      p.life++;
      if (p.life > p.max) continue;
      alive = true;
      p.vy += p.g;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max) * 0.9;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}
