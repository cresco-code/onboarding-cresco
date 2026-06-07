'use client';

import { useEffect, useState } from 'react';
import type { Phase } from '@/lib/onboarding';
import styles from './home.module.css';

/** El manifiesto de crescō — cómo trabajamos. Editorial, numerado, premium. */
const MANIFESTO: { t: string; d: string }[] = [
  { t: 'Pensamos antes de ejecutar.', d: 'Levantamos el sistema antes que la herramienta. La herramienta amplifica lo que ya existe.' },
  { t: 'Delegamos a la AI lo repetible.', d: 'La AI propone, las personas deciden. Nunca al revés.' },
  { t: 'Somos puntuales.', d: 'Prometemos poco y cumplimos grande. La puntualidad respeta el tiempo del cliente.' },
  { t: 'Somos honestos.', d: 'Decimos lo que falta y lo que nos costó. No vendemos lo que no tenemos.' },
  { t: 'Hacemos del proceso una experiencia.', d: 'Cada entrega lee como un libro — no como un SaaS.' },
];

/**
 * El umbral del onboarding:
 *   welcome  → "¡Bienvenido a crescō!" + "Hola {nombre}" + bienvenida cálida
 *   manifesto → cómo trabajamos, lectura premium numerada
 *   phase    → "Empieza tu onboarding · fase 1" → arranca (cartas)
 */
export function OnboardingIntro({
  firstName,
  firstPhase,
  onComplete,
}: {
  firstName: string;
  firstPhase: Phase;
  onComplete: () => void;
}) {
  const [sub, setSub] = useState<'welcome' | 'manifesto' | 'phase'>('welcome');

  useEffect(() => {
    if (sub !== 'phase') return;
    const t = window.setTimeout(onComplete, 2800);
    return () => window.clearTimeout(t);
  }, [sub, onComplete]);

  if (sub === 'phase') {
    return (
      <div className={styles.mfs} onClick={onComplete}>
        <div className={styles.phaseIntro}>
          <div className={styles.piEye} style={{ ['--d' as string]: '.1s' }}>Empieza tu onboarding</div>
          <div className={styles.piFase} style={{ ['--d' as string]: '.35s' }}>Fase 1</div>
          <div className={styles.piName} style={{ ['--d' as string]: '.7s', color: firstPhase.color }}>
            <span className={styles.piDot} style={{ background: firstPhase.color }} />
            {firstPhase.name}
          </div>
        </div>
      </div>
    );
  }

  if (sub === 'manifesto') {
    return (
      <div className={styles.mfs}>
        <div className={styles.mfsGlow} />
        <div className={styles.manifesto}>
          <div className={styles.mfEye} style={{ ['--d' as string]: '.1s' }}>Cómo trabajamos</div>
          <h2 className={styles.mfTitle} style={{ ['--d' as string]: '.22s' }}>
            Nuestro manifiesto.
          </h2>
          <ol className={styles.mfList}>
            {MANIFESTO.map((m, i) => (
              <li key={i} className={styles.mfItem} style={{ ['--d' as string]: `${0.5 + i * 0.22}s` }}>
                <span className={styles.mfNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.mfText}>
                  <div className={styles.mfT}>{m.t}</div>
                  <div className={styles.mfD}>{m.d}</div>
                </div>
              </li>
            ))}
          </ol>
          <button
            className={styles.mfsBtn}
            style={{ ['--d' as string]: `${0.5 + MANIFESTO.length * 0.22 + 0.25}s` }}
            onClick={() => setSub('phase')}
          >
            Empezar mi onboarding <span className={styles.mfsArr}>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mfs}>
      <div className={styles.mfsGlow} />
      <div className={styles.mfsInner}>
        <div className={styles.mfsEye} style={{ ['--d' as string]: '.1s' }}>¡Bienvenido a crescō!</div>
        <h1 className={styles.mfsHola} style={{ ['--d' as string]: '.28s' }}>Hola, {firstName}.</h1>
        <div className={styles.mfsBody}>
          <p style={{ ['--d' as string]: '.6s' }}>
            Estamos muy felices de tenerte como parte del equipo.
          </p>
          <p style={{ ['--d' as string]: '.82s' }}>
            Estamos seguros de que vamos a <em>crecer juntos</em>.
          </p>
        </div>
        <button className={styles.mfsBtn} style={{ ['--d' as string]: '1.2s' }} onClick={() => setSub('manifesto')}>
          Conoce cómo trabajamos <span className={styles.mfsArr}>→</span>
        </button>
      </div>
    </div>
  );
}
