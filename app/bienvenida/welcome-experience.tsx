'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import type { Locale } from '@/lib/i18n/locale';
import { LanguageToggle } from '@/components/language-toggle';
import styles from './welcome.module.css';

const ORDER = ['intro', 's1', 's2', 's3', 's4', 'done'] as const;
const DONE = ORDER.length - 1;

/** las 5 líneas del slide deck, con el fragmento acentuado aparte para el <span> */
const SLIDES: Record<Locale, { pre: string; accent: string; post?: string }[]> = {
  es: [
    { pre: 'Antes de arrancar, un poco sobre ', accent: 'crescō.' },
    { pre: 'Ayudamos a empresas y personas a través de la ', accent: 'tecnología.' },
    { pre: 'Hacemos ', accent: 'crecer', post: ' sus proyectos.' },
    { pre: 'Les enseñamos a hacer ', accent: 'más con menos.' },
    { pre: 'Hacemos del proceso una ', accent: 'experiencia.' },
  ],
  en: [
    { pre: 'Before we start, a bit about ', accent: 'crescō.' },
    { pre: 'We help companies and people through ', accent: 'technology.' },
    { pre: 'We help ', accent: 'grow', post: ' their projects.' },
    { pre: 'We teach them to do ', accent: 'more with less.' },
    { pre: 'We turn the process into an ', accent: 'experience.' },
  ],
};

export function WelcomeExperience() {
  const [active, setActive] = useState<number | null>(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const busy = useRef(false);
  const router = useRouter();
  const { locale } = useLocale();
  const ui = strings(locale);
  const slides = SLIDES[locale];

  const eff = active ?? leaving ?? 0;
  const name = ORDER[eff];
  const onSlide = name !== 'done';

  const finish = useCallback(() => {
    try {
      localStorage.setItem('cresco_welcome_done', '1');
    } catch {}
    router.push('/');
  }, [router]);

  const go = useCallback(
    (n: number) => {
      if (busy.current || active === null || n === active || n < 0 || n > DONE) return;
      busy.current = true;
      setLeaving(active);
      setActive(null);
      window.setTimeout(() => {
        setActive(n);
        setLeaving(null);
        window.setTimeout(() => {
          busy.current = false;
        }, 700);
      }, 480);
    },
    [active],
  );

  const next = useCallback(() => go(eff + 1), [go, eff]);
  const prev = useCallback(() => go(eff - 1), [go, eff]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!onSlide) return;
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSlide, next, prev]);

  const cls = (k: number) =>
    `${styles.scene}${k === active ? ' ' + styles.active : ''}${k === leaving ? ' ' + styles.leaving : ''}`;
  const step = name === 'done' ? ORDER.length - 1 : eff + 1;
  const ringFilled = active === DONE;

  return (
    <div className={styles.root} onClick={() => onSlide && next()}>
      <div className={styles.atmos}>
        <div className={`${styles.glow} ${styles.g1}`} />
        <div className={`${styles.glow} ${styles.g2}`} />
        <div className={styles.vig} />
        <div className={styles.grain} />
      </div>

      <div className={styles.mark}>
        <span className={styles.dot} />
        <span>cresc&#333;<span className={styles.d}>.</span></span>
      </div>

      <div className={styles.langToggle} onClick={(e) => e.stopPropagation()}>
        <LanguageToggle variant="dark" />
      </div>

      <button
        className={`${styles.skip}${onSlide ? ' ' + styles.show : ''}`}
        onClick={(e) => { e.stopPropagation(); go(DONE); }}
      >
        {ui.welcome.skip}
      </button>

      <div className={styles.stage}>
        {/* intro · un poco sobre crescō */}
        <section className={cls(0)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              {slides[0].pre}<span className={styles.ac}>{slides[0].accent}</span>{slides[0].post}
            </div>
          </div>
        </section>

        {/* s1 */}
        <section className={cls(1)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              {slides[1].pre}<span className={styles.ac}>{slides[1].accent}</span>{slides[1].post}
            </div>
          </div>
        </section>

        {/* s2 */}
        <section className={cls(2)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              {slides[2].pre}<span className={styles.ac}>{slides[2].accent}</span>{slides[2].post}
            </div>
          </div>
        </section>

        {/* s3 */}
        <section className={cls(3)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              {slides[3].pre}<span className={styles.ac}>{slides[3].accent}</span>{slides[3].post}
            </div>
          </div>
        </section>

        {/* s4 */}
        <section className={cls(4)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              {slides[4].pre}<span className={styles.ac}>{slides[4].accent}</span>{slides[4].post}
            </div>
          </div>
        </section>

        {/* done · handoff */}
        <section className={cls(5)}>
          <div className={`${styles.ring} ${styles.rise}`} style={{ ['--d' as string]: '.1s' }}>
            <svg width="120" height="120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#2c2a24" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="50" fill="none" stroke="#7E9A80" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={ringFilled ? 188 : 314}
                style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1) .35s' }}
              />
            </svg>
            <div className={styles.ctr}>🌱</div>
          </div>
          <div className={`${styles.big} ${styles.rise}`} style={{ ['--d' as string]: '.3s' }}>
            {ui.welcome.doneLine}
          </div>
          <div className={`${styles.below} ${styles.rise}`} style={{ ['--d' as string]: '.5s' }}>
            {ui.welcome.belowLine}
          </div>
          <button
            className={`${styles.adv} ${styles.rise}`}
            style={{ ['--d' as string]: '.7s' }}
            onClick={(e) => { e.stopPropagation(); finish(); }}
          >
            {ui.welcome.start} <span className={styles.arr}>→</span>
          </button>
        </section>
      </div>

      <div className={`${styles.progress}${onSlide ? ' ' + styles.show : ''}`}>
        {Array.from({ length: ORDER.length - 1 }, (_, i) => i).map((i) => (
          <span key={i} className={`${styles.seg}${i < step ? ' ' + styles.on : ''}`} />
        ))}
      </div>

      <div className={`${styles.hint}${name === 'intro' ? ' ' + styles.show : ''}`}>
        {ui.welcome.hint}
      </div>
    </div>
  );
}
