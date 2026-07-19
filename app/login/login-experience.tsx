'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import { LanguageToggle } from '@/components/language-toggle';
import styles from './login.module.css';

export function LoginExperience() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useLocale();
  const ui = strings(locale);

  // parallax por profundidad
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const layers = Array.from(scene.querySelectorAll<SVGPathElement>(`.${styles.layer}`));
    const sun = scene.querySelector<HTMLElement>(`.${styles.sun}`);

    // largo real del trazo del ascenso → alimenta el dibujo (stroke-dashoffset)
    scene.querySelectorAll<SVGPathElement>(`.${styles.climb} path`).forEach((p) => {
      p.style.setProperty('--len', String(p.getTotalLength()));
    });
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: MouseEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    const onLeave = () => { tx = 0; ty = 0; };
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth || 0);
        l.style.transform = `translate(${-cx * d}px,${-cy * d * 0.4}px)`;
      });
      if (sun) { sun.style.marginLeft = `${-cx * 10}px`; sun.style.marginTop = `${-cy * 8}px`; }
      raf = requestAnimationFrame(loop);
    };
    scene.addEventListener('mousemove', onMove);
    scene.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); scene.removeEventListener('mousemove', onMove); scene.removeEventListener('mouseleave', onLeave); };
  }, []);

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const onEnter = async (skipDomainHint = false) => {
    if (loading) return;
    setLoading(true);
    const next = params.get('next') ?? '/';

    // modo diseño local (sin Supabase configurado): pasa directo a la experiencia
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setTimeout(() => router.push(next), 1100);
      return;
    }

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          // fuerza el selector de cuenta de Google en vez de re-loguear en silencio con la sesión
          // que quedó activa en el navegador — así "salir" sí te deja entrar con otra cuenta
          prompt: 'select_account',
          // solo cuentas del workspace cresco.so (Google las pre-filtra con hd) — el botón demo lo omite a propósito
          ...(skipDomainHint ? {} : { hd: process.env.NEXT_PUBLIC_TEAM_DOMAIN ?? 'cresco.so' }),
        },
      },
    });
    if (error) setLoading(false);
  };

  return (
    <div className={styles.scene} ref={sceneRef}>
      <div className={styles.horizon} />
      <div className={styles.sun} />
      <div className={styles.mist} />

      <div className={styles.flock}>
        {/* guacamaya roja */}
        <div className={styles.bird}>
          <svg viewBox="0 0 64 34">
            <defs>
              <linearGradient id="gRoja" gradientUnits="userSpaceOnUse" x1="6" y1="16" x2="62" y2="15">
                <stop offset="0" stopColor="#C1342A" /><stop offset=".5" stopColor="#E0A52E" /><stop offset="1" stopColor="#1E6FB0" />
              </linearGradient>
            </defs>
            <path fill="none" stroke="#1E6FB0" strokeWidth="2.2" strokeLinecap="round" d="M34 16 L 22 33" />
            <g className={styles.wings} fill="none" stroke="url(#gRoja)" strokeWidth="2.9" strokeLinecap="round">
              <path d="M34 16 C 25 6, 15 8, 7 15" /><path d="M34 16 C 43 8, 53 9, 62 14" />
            </g>
          </svg>
        </div>
        {/* guacamaya azul */}
        <div className={`${styles.bird} ${styles.b2}`}>
          <svg viewBox="0 0 64 34">
            <defs>
              <linearGradient id="gAzul" gradientUnits="userSpaceOnUse" x1="6" y1="16" x2="62" y2="15">
                <stop offset="0" stopColor="#1E6FB0" /><stop offset=".5" stopColor="#2E8C84" /><stop offset="1" stopColor="#E0A52E" />
              </linearGradient>
            </defs>
            <path fill="none" stroke="#E0A52E" strokeWidth="2.2" strokeLinecap="round" d="M34 16 L 22 33" />
            <g className={styles.wings} fill="none" stroke="url(#gAzul)" strokeWidth="2.9" strokeLinecap="round">
              <path d="M34 16 C 25 6, 15 8, 7 15" /><path d="M34 16 C 43 8, 53 9, 62 14" />
            </g>
          </svg>
        </div>
      </div>

      <div className={styles.range}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path className={styles.layer} data-depth="6" fill="#C6CFBF" d="M0,372 L130,338 L270,360 L430,306 L610,348 L800,296 L1000,338 L1200,304 L1330,336 L1440,314 L1440,600 L0,600 Z" />
          <path className={styles.layer} data-depth="14" fill="#9DAD94" d="M0,430 L180,386 L350,418 L530,352 L720,406 L920,344 L1120,398 L1300,356 L1440,388 L1440,600 L0,600 Z" />
          <path className={styles.layer} data-depth="26" fill="#647A66" d="M0,492 L160,446 L390,500 L580,424 L780,492 L1000,416 L1220,480 L1390,436 L1440,466 L1440,600 L0,600 Z" />
          <path className={styles.layer} data-depth="42" fill="#3D5240" d="M0,548 L250,504 L500,552 L760,498 L1010,552 L1270,506 L1440,536 L1440,600 L0,600 Z" />

          {/* ░ la luz que escala la cima · símbolo de crecer ░ */}
          <defs>
            <linearGradient id="climbGold" gradientUnits="userSpaceOnUse" x1="0" y1="398" x2="0" y2="302">
              <stop offset="0" stopColor="#8AA487" />
              <stop offset=".45" stopColor="#C2BC8B" />
              <stop offset=".78" stopColor="#E9D29A" />
              <stop offset="1" stopColor="#FFFDF4" />
            </linearGradient>
            <radialGradient id="bloomGold" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#FFFDF6" stopOpacity=".7" />
              <stop offset=".4" stopColor="#F4E2AE" stopOpacity=".34" />
              <stop offset="1" stopColor="#F4E2AE" stopOpacity="0" />
            </radialGradient>
            <filter id="glowF" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3" /></filter>
            {/* máscara que se desliza: el camino hace fade out de la cola de abajo hacia arriba */}
            <linearGradient id="fadeGrad" gradientUnits="userSpaceOnUse" x1="0" y1="430" x2="0" y2="276">
              <stop offset="0" stopColor="#000" />
              <stop offset=".15" stopColor="#000" />
              <stop offset=".36" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" />
              <animateTransform attributeName="gradientTransform" type="translate" dur="10.5s" begin="0.35s" fill="freeze" keyTimes="0;0.54;1" values="0 72;0 72;0 -124" calcMode="spline" keySplines="0 0 1 1;.4 0 .25 1" />
            </linearGradient>
            <mask id="fadeMask" maskUnits="userSpaceOnUse" x="268" y="262" width="224" height="200">
              <rect x="268" y="262" width="224" height="200" fill="url(#fadeGrad)" />
            </mask>
          </defs>

          <g className={`${styles.layer} ${styles.climb}`} data-depth="6">
            <g className={styles.trailWrap} mask="url(#fadeMask)">
              <path className={styles.trailGlow} d="M330,397 C404,392 402,356 344,350 C296,345 408,330 408,316 C410,310 422,308 430,306" />
              <path className={styles.trail} d="M330,397 C404,392 402,356 344,350 C296,345 408,330 408,316 C410,310 422,308 430,306" />
              <path className={styles.trailCore} d="M330,397 C404,392 402,356 344,350 C296,345 408,330 408,316 C410,310 422,308 430,306" />
            </g>
            <g className={styles.summitBloom}>
              <circle cx="430" cy="306" r="44" fill="url(#bloomGold)" />
              <circle cx="430" cy="306" r="6" fill="#FFFDF6" filter="url(#glowF)" />
              <circle cx="430" cy="306" r="2.4" fill="#FFFFFF" />
            </g>
          </g>
        </svg>
      </div>

      <div className={styles.grain} />

      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 60 }}><LanguageToggle variant="dark" /></div>

      <div className={styles.ui}>
        <div className={styles.eye}>{ui.login.eyebrow}</div>
        <div className={styles.big}>cresc&#333;<span className={styles.d}>.</span></div>
        <button className={`${styles.enter}${loading ? ' ' + styles.loading : ''}`} onClick={() => onEnter()}>
          <span className={styles.spin} />
          <span className={styles.lbl}>{loading ? ui.login.entering : ui.login.enter}</span>
          <span className={styles.arr}>→</span>
        </button>
        {demoMode && (
          <button className={styles.demoEnter} onClick={() => onEnter(true)}>
            {ui.login.demoEnter}
          </button>
        )}
      </div>
    </div>
  );
}
