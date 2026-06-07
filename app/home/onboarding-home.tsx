'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleTaskAction } from '@/app/actions';
import { PHASES, phaseOf, type OnbItem } from '@/lib/onboarding';
import { TaskReader } from './task-reader';
import { TaskCards } from './task-cards';
import { OnboardingIntro } from './onboarding-intro';
import styles from './home.module.css';

const C = 327; // circunferencia del anillo (r=52)
const LS = (id: string) => `cresco_onb_${id}`;
const LS_VIEW = 'cresco_onb_view';
const LS_MANIFESTO = 'cresco_manifesto_done';

export function OnboardingHome({
  name,
  area,
  tasks: initial,
}: {
  name: string;
  area: string | null;
  tasks: OnbItem[];
}) {
  const [tasks, setTasks] = useState(initial);
  const [open, setOpen] = useState<OnbItem | null>(null);
  const [view, setView] = useState<'list' | 'cards'>('cards'); // arranca en cartas
  const [introDone, setIntroDone] = useState(true); // se corrige en el montaje
  const [, startTransition] = useTransition();

  // restaura el progreso local + la vista preferida + el manifiesto al montar
  useEffect(() => {
    setTasks((ts) =>
      ts.map((t) =>
        t.source === 'default' && typeof window !== 'undefined' && localStorage.getItem(LS(t.id)) === '1'
          ? { ...t, done: true }
          : t,
      ),
    );
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem(LS_VIEW);
      if (v === 'cards' || v === 'list') setView(v); // respeta la preferencia; si no, cartas
      setIntroDone(localStorage.getItem(LS_MANIFESTO) === '1');
    }
  }, []);

  const changeView = (v: 'list' | 'cards') => {
    setView(v);
    if (typeof window !== 'undefined') localStorage.setItem(LS_VIEW, v);
  };

  const finishIntro = () => {
    if (typeof window !== 'undefined') localStorage.setItem(LS_MANIFESTO, '1');
    setView('cards');
    setIntroDone(true);
  };

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  const offset = C * (1 - pct / 100);
  const firstName = name.split(' ')[0];

  const setDone = (item: OnbItem, nextDone: boolean) => {
    setTasks((ts) => ts.map((x) => (x.id === item.id ? { ...x, done: nextDone } : x)));
    if (item.notionId) {
      startTransition(() => void toggleTaskAction(item.notionId!, nextDone));
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(LS(item.id), nextDone ? '1' : '0');
    }
  };
  const toggle = (item: OnbItem) => setDone(item, !tasks.find((t) => t.id === item.id)?.done);

  const openDone = open ? (tasks.find((t) => t.id === open.id)?.done ?? false) : false;

  // umbral: "Hola {nombre}" + manifiesto → fase 1 → onboarding (cartas)
  if (!introDone) {
    return <OnboardingIntro firstName={firstName} firstPhase={PHASES[0]} onComplete={finishIntro} />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.grain} />
      <div className={styles.wrap}>
        <div className={styles.mark}>
          <span className={styles.dot} />
          <span>cresc&#333;<span className={styles.d}>.</span></span>
        </div>

        {view === 'list' && (
          <div className={styles.head}>
            <div className={styles.greet}>
              <div className={styles.eye}>{area ? area + ' · ' : ''}tu onboarding</div>
              <h1>
                Hola, {firstName}.
                {allDone && (
                  <>
                    <br />
                    <em>lo lograste.</em>
                  </>
                )}
              </h1>
              <p className={styles.sub}>
                {allDone
                  ? 'Completaste tu onboarding. Bienvenido de verdad al equipo.'
                  : `${done} de ${total} pasos. Ábrelos, hazlos, márcalos.`}
              </p>
            </div>

            <div className={styles.ring}>
              <svg width="118" height="118">
                <circle cx="59" cy="59" r="52" fill="none" stroke="#E2DBCC" strokeWidth="8" />
                <circle
                  className={styles.fill}
                  cx="59" cy="59" r="52" fill="none" stroke="#3D5240" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={offset}
                />
              </svg>
              <div className={styles.ctr}>
                <span className={styles.sprout}>{allDone ? '🌿' : '🌱'}</span>
                <span className={styles.pc}>{pct}%</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.seg}>
          <button
            className={`${styles.segBtn}${view === 'list' ? ' ' + styles.segOn : ''}`}
            onClick={() => changeView('list')}
          >
            ☰ Lista
          </button>
          <button
            className={`${styles.segBtn}${view === 'cards' ? ' ' + styles.segOn : ''}`}
            onClick={() => changeView('cards')}
          >
            ▢ Cartas
          </button>
        </div>

        {view === 'list' ? (
          <div className={styles.list}>
            {PHASES.map((ph) => {
              const phaseTasks = tasks.filter((t) => phaseOf(t.name).key === ph.key);
              if (phaseTasks.length === 0) return null;
              const phDone = phaseTasks.filter((t) => t.done).length;
              return (
                <section key={ph.key} className={styles.phaseSec}>
                  <div className={styles.phaseHd}>
                    <span className={styles.phaseHdDot} style={{ background: ph.color }} />
                    <span className={styles.phaseHdName} style={{ color: ph.color }}>{ph.name}</span>
                    <span className={styles.phaseHdCount}>{phDone}/{phaseTasks.length}</span>
                  </div>
                  {phaseTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`${styles.row}${t.done ? ' ' + styles.done : ''}`}
                      onClick={() => setOpen(t)}
                    >
                      <button
                        className={`${styles.check}${t.done ? ' ' + styles.done : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggle(t); }}
                        aria-label={t.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                        style={{ ['--pc' as string]: ph.color }}
                      >
                        <svg viewBox="0 0 26 26"><path d="M7 13.5 L11 17.5 L19 9" /></svg>
                      </button>
                      <div className={styles.body}>
                        <div className={styles.name}>{t.name}</div>
                        {t.blurb && <div className={styles.blurb}>{t.blurb}</div>}
                      </div>
                      <span className={styles.rowKind}>{t.kind === 'read' ? '📖' : '↗'}</span>
                      <span className={styles.open}>→</span>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        ) : (
          <TaskCards
            tasks={tasks}
            firstName={firstName}
            onDone={(item) => setDone(item, true)}
            onClose={() => changeView('list')}
          />
        )}

        {allDone && (
          <div className={styles.celebrate}>
            <div className={styles.cm}>🌿</div>
            <h2>Estás listo, {firstName}.</h2>
            <p>Nosotros también crecimos contigo. A construir.</p>
          </div>
        )}

        <section className={styles.prj}>
          <div className={styles.prjHd}>tus proyectos <span className={styles.e}>¿a dónde entras?</span></div>
          <Link href="/mogos" className={styles.prjCard}>
            <span className={styles.prjIc}>📦</span>
            <div className={styles.prjBody}>
              <div className={styles.prjName}>mogos group</div>
              <div className={styles.prjSub}>Logística China → Venezuela. Busca, entiende y entra al código.</div>
              <div className={styles.prjMeta}>Qué es · Los datos · Arquitectura · El sistema · Arranque</div>
            </div>
            <span className={styles.prjGo}>→</span>
          </Link>
          <Link href="/amedi" className={styles.prjCard} style={{ marginTop: 10 }}>
            <span className={styles.prjIc}>🩺</span>
            <div className={styles.prjBody}>
              <div className={styles.prjName}>amedi</div>
              <div className={styles.prjSub}>Plataforma de salud venezolana. Médicos, pacientes y consultas.</div>
              <div className={styles.prjMeta}>Qué es · Los datos · Arquitectura · El sistema · Arranque</div>
            </div>
            <span className={styles.prjGo}>→</span>
          </Link>
        </section>

        <div className={styles.foot}>
          <span>crescō · onboarding</span>
        </div>
      </div>

      {open && (
        <TaskReader
          item={open}
          done={openDone}
          onClose={() => setOpen(null)}
          onToggle={() => toggle(open)}
        />
      )}
    </main>
  );
}
