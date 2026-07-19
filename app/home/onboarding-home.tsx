'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleTaskAction } from '@/app/actions';
import { supabaseBrowser } from '@/lib/supabase/client';
import { PHASES, phaseOf, phaseName, translateTask, type OnbItem, type OnboardingError } from '@/lib/onboarding';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import { LanguageToggle } from '@/components/language-toggle';
import { TaskReader } from './task-reader';
import { TaskCards } from './task-cards';
import { OnboardingIntro } from './onboarding-intro';
import { fireConfetti } from './confetti';
import styles from './home.module.css';

const C = 327; // circunferencia del anillo (r=52)
const LS = (id: string) => `cresco_onb_${id}`;
const LS_VIEW = 'cresco_onb_view';
const LS_MANIFESTO = 'cresco_manifesto_done';

export function OnboardingHome({
  name,
  area,
  tasks: initial,
  error = null,
  email = null,
}: {
  name: string;
  area: string | null;
  tasks: OnbItem[];
  error?: OnboardingError;
  email?: string | null;
}) {
  const { locale } = useLocale();
  const ui = strings(locale);
  const [tasks, setTasks] = useState(initial);
  const [open, setOpen] = useState<OnbItem | null>(null);
  const [view, setView] = useState<'list' | 'cards'>('cards'); // arranca en cartas
  const [introDone, setIntroDone] = useState(true); // se corrige en el montaje
  const [, startTransition] = useTransition();
  const router = useRouter();

  const onLogout = async () => {
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      /* en modo diseño (sin Supabase) igual mandamos al login */
    }
    router.replace('/login');
  };

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
    // ¿esta acción completa la sección (fase)? → confetti sutil
    if (nextDone) {
      const key = phaseOf(item.name).key;
      const inPhase = tasks.filter((t) => phaseOf(t.name).key === key);
      const wasComplete = inPhase.length > 0 && inPhase.every((t) => t.done);
      const willComplete = inPhase.length > 0 && inPhase.every((t) => (t.id === item.id ? true : t.done));
      if (!wasComplete && willComplete) fireConfetti({ color: phaseOf(item.name).color });
    }
    setTasks((ts) => ts.map((x) => (x.id === item.id ? { ...x, done: nextDone } : x)));
    if (item.notionId) {
      startTransition(() => void toggleTaskAction(item.notionId!, nextDone));
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(LS(item.id), nextDone ? '1' : '0');
    }
  };
  const toggle = (item: OnbItem) => setDone(item, !tasks.find((t) => t.id === item.id)?.done);

  const openDone = open ? (tasks.find((t) => t.id === open.id)?.done ?? false) : false;

  const logoutBtn = (
    <button className={styles.logout} onClick={onLogout} aria-label={ui.home.logoutAria}>
      <span>{ui.home.logoutLabel}</span>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 4v16" />
      </svg>
    </button>
  );

  // si Notion falló o no hay perfil en el equipo: lo decimos claro, no mostramos tareas falsas
  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.grain} />
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            <div className={styles.mark}>
              <span className={styles.dot} />
              <span>cresc&#333;<span className={styles.d}>.</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LanguageToggle />
              {logoutBtn}
            </div>
          </div>
          <div className={styles.errbox}>
            <div className={styles.errmark}>🌱</div>
            <h2>{error === 'no-team' ? ui.home.errNoTeamTitle : ui.home.errNotionTitle}</h2>
            <p>
              {error === 'no-team' ? (
                <>
                  {ui.home.errNoTeamPre}{email ? <b>{email}</b> : ''}{ui.home.errNoTeamPost}
                </>
              ) : (
                <>{ui.home.errNotionBody}</>
              )}
            </p>
            <div className={styles.erractions}>
              {error !== 'no-team' && (
                <button className={styles.errbtn} onClick={() => window.location.reload()}>
                  {ui.home.retry}
                </button>
              )}
              <button className={styles.errghost} onClick={onLogout}>{ui.home.switchAccount}</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // umbral: "Hola {nombre}" + manifiesto → fase 1 → onboarding (cartas)
  if (!introDone) {
    return <OnboardingIntro firstName={firstName} firstPhase={PHASES[0]} onComplete={finishIntro} />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.grain} />
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div className={styles.mark}>
            <span className={styles.dot} />
            <span>cresc&#333;<span className={styles.d}>.</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageToggle />
            {logoutBtn}
          </div>
        </div>

        {view === 'list' && (
          <div className={styles.head}>
            <div className={styles.greet}>
              <div className={styles.eye}>{area ? area + ' · ' : ''}{ui.home.eyeOnboarding}</div>
              <h1>
                {ui.home.hello(firstName)}
                {allDone && (
                  <>
                    <br />
                    <em>{ui.home.allDoneEm}</em>
                  </>
                )}
              </h1>
              <p className={styles.sub}>
                {allDone ? ui.home.subAllDone : ui.home.subProgress(done, total)}
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
            {ui.home.segList}
          </button>
          <button
            className={`${styles.segBtn}${view === 'cards' ? ' ' + styles.segOn : ''}`}
            onClick={() => changeView('cards')}
          >
            {ui.home.segCards}
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
                    <span className={styles.phaseHdName} style={{ color: ph.color }}>{phaseName(ph, locale)}</span>
                    <span className={styles.phaseHdCount}>{phDone}/{phaseTasks.length}</span>
                  </div>
                  {phaseTasks.map((t) => {
                    const tt = translateTask(t, locale);
                    return (
                      <div
                        key={t.id}
                        className={`${styles.row}${t.done ? ' ' + styles.done : ''}`}
                        onClick={() => setOpen(t)}
                      >
                        <button
                          className={`${styles.check}${t.done ? ' ' + styles.done : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggle(t); }}
                          aria-label={t.done ? ui.home.markPending : ui.home.markDone}
                          style={{ ['--pc' as string]: ph.color }}
                        >
                          <svg viewBox="0 0 26 26"><path d="M7 13.5 L11 17.5 L19 9" /></svg>
                        </button>
                        <div className={styles.body}>
                          <div className={styles.name}>{tt.name}</div>
                          {tt.blurb && <div className={styles.blurb}>{tt.blurb}</div>}
                        </div>
                        <span className={styles.rowKind}>{t.kind === 'read' ? '📖' : '↗'}</span>
                        <span className={styles.open}>→</span>
                      </div>
                    );
                  })}
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
            <h2>{ui.home.celebrateTitle(firstName)}</h2>
            <p>{ui.home.celebrateBody}</p>
          </div>
        )}

        <section className={styles.prj}>
          <div className={styles.prjHd}>{ui.home.projectsEyebrow} <span className={styles.e}>{ui.home.projectsQuestion}</span></div>
          <Link href="/mogos" className={styles.prjCard}>
            <span className={styles.prjIc}>📦</span>
            <div className={styles.prjBody}>
              <div className={styles.prjName}>mogos group</div>
              <div className={styles.prjSub}>{ui.home.mogosDesc}</div>
              <div className={styles.prjMeta}>{ui.home.projMeta}</div>
            </div>
            <span className={styles.prjGo}>→</span>
          </Link>
          <Link href="/amedi" className={styles.prjCard} style={{ marginTop: 10 }}>
            <span className={styles.prjIc}>🩺</span>
            <div className={styles.prjBody}>
              <div className={styles.prjName}>amedi</div>
              <div className={styles.prjSub}>{ui.home.amediDesc}</div>
              <div className={styles.prjMeta}>{ui.home.projMeta}</div>
            </div>
            <span className={styles.prjGo}>→</span>
          </Link>
        </section>

        <div className={styles.foot}>
          <span>{ui.home.footer}</span>
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
