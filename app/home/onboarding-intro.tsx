'use client';

import { useEffect, useState } from 'react';
import type { Phase } from '@/lib/onboarding';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import { LanguageToggle } from '@/components/language-toggle';
import styles from './home.module.css';

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
  const { locale } = useLocale();
  const ui = strings(locale);
  const MANIFESTO = ui.intro.manifesto;

  useEffect(() => {
    if (sub !== 'phase') return;
    const t = window.setTimeout(onComplete, 2800);
    return () => window.clearTimeout(t);
  }, [sub, onComplete]);

  if (sub === 'phase') {
    return (
      <div className={styles.mfs} onClick={onComplete}>
        <div className={styles.phaseIntro}>
          <div className={styles.piEye} style={{ ['--d' as string]: '.1s' }}>{ui.intro.startOnboarding}</div>
          <div className={styles.piFase} style={{ ['--d' as string]: '.35s' }}>{ui.intro.phaseWord}</div>
          <div className={styles.piName} style={{ ['--d' as string]: '.7s', color: firstPhase.color }}>
            <span className={styles.piDot} style={{ background: firstPhase.color }} />
            {locale === 'en' ? firstPhase.nameEn : firstPhase.name}
          </div>
        </div>
      </div>
    );
  }

  if (sub === 'manifesto') {
    return (
      <div className={styles.mfs}>
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 60 }}><LanguageToggle /></div>
        <div className={styles.mfsGlow} />
        <div className={styles.manifesto}>
          <div className={styles.mfEye} style={{ ['--d' as string]: '.1s' }}>{ui.intro.howWeWork}</div>
          <h2 className={styles.mfTitle} style={{ ['--d' as string]: '.22s' }}>
            {ui.intro.manifestoTitle}
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
            {ui.intro.ready} <span className={styles.mfsArr}>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mfs}>
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 60 }}><LanguageToggle /></div>
      <div className={styles.mfsGlow} />
      <div className={styles.mfsInner}>
        <div className={styles.mfsEye} style={{ ['--d' as string]: '.1s' }}>{ui.intro.welcomeEyebrow}</div>
        <h1 className={styles.mfsHola} style={{ ['--d' as string]: '.28s' }}>{ui.intro.hello(firstName)}</h1>
        <div className={styles.mfsBody}>
          <p style={{ ['--d' as string]: '.6s' }}>
            {ui.intro.welcomeP1}
          </p>
          <p style={{ ['--d' as string]: '.82s' }}>
            {ui.intro.welcomeP2Pre}<em>{ui.intro.welcomeP2Em}</em>{ui.intro.welcomeP2Post}
          </p>
        </div>
        <button className={styles.mfsBtn} style={{ ['--d' as string]: '1.2s' }} onClick={() => setSub('manifesto')}>
          {ui.intro.howWeWork} <span className={styles.mfsArr}>→</span>
        </button>
      </div>
    </div>
  );
}
