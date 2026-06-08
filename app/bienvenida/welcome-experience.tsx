'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';

const ORDER = ['intro', 's1', 's2', 's3', 's4', 'done'] as const;
const DONE = ORDER.length - 1;

export function WelcomeExperience() {
  const [active, setActive] = useState<number | null>(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const busy = useRef(false);
  const router = useRouter();

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

      <button
        className={`${styles.skip}${onSlide ? ' ' + styles.show : ''}`}
        onClick={(e) => { e.stopPropagation(); go(DONE); }}
      >
        saltar intro
      </button>

      <div className={styles.stage}>
        {/* intro · un poco sobre crescō */}
        <section className={cls(0)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              Antes de arrancar, un poco sobre <span className={styles.ac}>crescō.</span>
            </div>
          </div>
        </section>

        {/* s1 */}
        <section className={cls(1)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              Ayudamos a empresas y personas a través de la <span className={styles.ac}>tecnología.</span>
            </div>
          </div>
        </section>

        {/* s2 */}
        <section className={cls(2)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              Hacemos <span className={styles.ac}>crecer</span> sus proyectos.
            </div>
          </div>
        </section>

        {/* s3 */}
        <section className={cls(3)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              Les enseñamos a hacer <span className={styles.ac}>más con menos.</span>
            </div>
          </div>
        </section>

        {/* s4 */}
        <section className={cls(4)}>
          <div className={styles.rise} style={{ ['--d' as string]: '.2s' }}>
            <div className={styles.line}>
              Hacemos del proceso una <span className={styles.ac}>experiencia.</span>
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
            Nosotros también crecemos.
          </div>
          <div className={`${styles.below} ${styles.rise}`} style={{ ['--d' as string]: '.5s' }}>
            Día cero, listo para empezar.
          </div>
          <button
            className={`${styles.adv} ${styles.rise}`}
            style={{ ['--d' as string]: '.7s' }}
            onClick={(e) => { e.stopPropagation(); finish(); }}
          >
            Comenzar <span className={styles.arr}>→</span>
          </button>
        </section>
      </div>

      <div className={`${styles.progress}${onSlide ? ' ' + styles.show : ''}`}>
        {Array.from({ length: ORDER.length - 1 }, (_, i) => i).map((i) => (
          <span key={i} className={`${styles.seg}${i < step ? ' ' + styles.on : ''}`} />
        ))}
      </div>

      <div className={`${styles.hint}${name === 'intro' ? ' ' + styles.show : ''}`}>
        click, espacio o → para avanzar
      </div>
    </div>
  );
}
