'use client';

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type CSSProperties } from 'react';
import { phaseOf, type OnbItem, type Phase } from '@/lib/onboarding';
import type { CBlock } from '@/lib/notion-content';
import { getTaskContentAction } from '@/app/actions';
import { TaskBody } from './task-body';
import styles from './home.module.css';

const THRESH = 140; // px para confirmar el swipe
const DRAG_START = 8; // px antes de empezar a arrastrar (deja pasar los clicks)

export function TaskCards({
  tasks,
  onDone,
  onClose,
  firstName,
}: {
  tasks: OnbItem[];
  onDone: (item: OnbItem) => void;
  onClose: () => void;
  firstName: string;
}) {
  const [order, setOrder] = useState<string[]>(() => tasks.filter((t) => !t.done).map((t) => t.id));
  const [d, setD] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<{ id: string; dir: 'done' | 'skip' } | null>(null);
  const [cache, setCache] = useState<Record<string, CBlock[]>>({});
  const [phaseDone, setPhaseDone] = useState<{ completed: Phase; next: Phase } | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  const byId = (id: string) => tasks.find((t) => t.id === id);
  const visible = order.map(byId).filter((t): t is OnbItem => !!t && !t.done);
  const top = visible[0];
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;

  // bloquea el scroll del fondo + Esc para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // precarga el contenido del top y el siguiente
  useEffect(() => {
    [visible[0], visible[1]].forEach((t) => {
      const nid = t?.notionId;
      if (nid && !(nid in cache)) getTaskContentAction(nid).then((b) => setCache((c) => ({ ...c, [nid]: b })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top?.id]);

  const commit = (dir: 'done' | 'skip') => {
    if (!top || leaving) return;
    const id = top.id;
    const card = top;
    setLeaving({ id, dir });
    setD({ x: dir === 'done' ? 1 : -1, y: 0 });
    window.setTimeout(() => {
      if (dir === 'done') {
        // ¿esta carta cierra la fase? → confetti (en setDone) + transición de fase
        const ph = phaseOf(card.name);
        const phaseTasks = tasks.filter((x) => phaseOf(x.name).key === ph.key);
        const completes = phaseTasks.length > 0 && phaseTasks.every((x) => x.id === card.id || x.done);
        const next = visible.find((v) => v.id !== card.id) ?? null;
        onDone(card);
        if (completes && next) {
          window.setTimeout(() => setPhaseDone({ completed: ph, next: phaseOf(next.name) }), 240);
        }
      } else {
        setOrder((o) => [...o.filter((x) => x !== id), id]);
      }
      setLeaving(null);
      setD({ x: 0, y: 0 });
    }, 360);
  };

  // la transición de fase se va sola tras un momento (o con click)
  useEffect(() => {
    if (!phaseDone) return;
    const t = window.setTimeout(() => setPhaseDone(null), 2800);
    return () => window.clearTimeout(t);
  }, [phaseDone]);

  const onDown = (e: RPointerEvent) => {
    if (leaving) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
  };
  const onMove = (e: RPointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) > DRAG_START) {
      movedRef.current = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (movedRef.current) setD({ x: dx, y: dy * 0.18 });
  };
  const onUp = () => {
    const wasDragging = movedRef.current;
    startRef.current = null;
    movedRef.current = false;
    setDragging(false);
    if (!wasDragging) return; // fue un click (enlace), no swipe
    if (d.x > THRESH) commit('done');
    else if (d.x < -THRESH) commit('skip');
    else setD({ x: 0, y: 0 });
  };

  const yes = Math.max(0, Math.min(1, d.x / THRESH));
  const no = Math.max(0, Math.min(1, -d.x / THRESH));

  return (
    <div className={styles.fs}>
      <div className={styles.fsBack} onClick={onClose} />

      <div className={styles.fsTop}>
        <button className={styles.fsClose} onClick={onClose} aria-label="Volver a la lista">← lista</button>
      </div>

      {!top ? (
        <div className={styles.fsDone}>
          <div className={styles.cdoneMark}>🌿</div>
          <h2>Listo, {firstName}.</h2>
          <p>Pasaste por todas tus cartas. Bienvenido de verdad al equipo.</p>
          <button className={styles.fsDoneBtn} onClick={onClose}>volver a la lista</button>
        </div>
      ) : (
        <>
          {/* paneles a los lados (clic + objetivo del swipe) */}
          <button
            className={`${styles.side} ${styles.sideL}`}
            style={{ opacity: 0.85 + no * 0.15, transform: `translateY(-50%) scale(${1 + no * 0.06})` }}
            onClick={() => commit('skip')}
          >
            <span className={styles.sideIcon}>↩</span>
            <span className={styles.sideLabel}>luego</span>
          </button>
          <button
            className={`${styles.side} ${styles.sideR}`}
            style={{ opacity: 0.85 + yes * 0.15, transform: `translateY(-50%) scale(${1 + yes * 0.06})` }}
            onClick={() => commit('done')}
          >
            <span className={styles.sideIcon}>✓</span>
            <span className={styles.sideLabel}>hecho</span>
          </button>

          <div className={styles.fsStage}>
            {visible.slice(0, 2).reverse().map((t) => {
              const depth = visible.indexOf(t);
              const isTop = depth === 0;
              const isLeaving = leaving?.id === t.id;
              const fly = isLeaving ? (leaving!.dir === 'done' ? 1 : -1) : 0;
              const tx = isLeaving ? fly * 900 : isTop ? d.x : 0;
              const ty = isTop && !isLeaving ? d.y : 0;
              const rot = isTop ? (isLeaving ? fly * 14 : d.x * 0.03) : 0;
              const style: CSSProperties = {
                transform: isTop
                  ? `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${dragging ? 1.012 : 1})`
                  : `translateY(22px) scale(.95)`,
                transition: dragging && isTop ? 'none' : 'transform .36s cubic-bezier(.22,1,.36,1), opacity .36s',
                opacity: isLeaving ? 0 : 1,
                zIndex: 10 - depth,
              };
              const content = t.notionId ? (cache[t.notionId] ?? null) : [];
              const ph = phaseOf(t.name);
              const phaseTasks = tasks.filter((x) => phaseOf(x.name).key === ph.key);
              const posInPhase = phaseTasks.findIndex((x) => x.id === t.id) + 1;
              return (
                <article
                  key={t.id}
                  className={styles.fcard}
                  style={style}
                  onPointerDown={isTop ? onDown : undefined}
                  onPointerMove={isTop ? onMove : undefined}
                  onPointerUp={isTop ? onUp : undefined}
                >
                  <div className={styles.fphase} style={{ backgroundColor: ph.color + '17', color: ph.color }}>
                    <span className={styles.fphaseDot} style={{ background: ph.color }} />
                    <span className={styles.fphaseName}>{ph.name}</span>
                    <span className={styles.fphasePos}>{posInPhase} de {phaseTasks.length}</span>
                  </div>
                  <div className={styles.fhead}>
                    {t.kind === 'read' ? (
                      <span className={styles.kind}>📖 leer{t.readMins ? ` · ${t.readMins} min` : ''}</span>
                    ) : (
                      <span className={`${styles.kind} ${styles.act}`}>↗ acción</span>
                    )}
                    <h3 className={styles.fname}>{t.name}</h3>
                  </div>
                  {isTop && <div className={styles.fbody}><TaskBody blocks={content} name={t.name} /></div>}

                  {/* tinte de color al arrastrar */}
                  {isTop && (
                    <>
                      <div className={`${styles.wash} ${styles.washYes}`} style={{ opacity: yes }}>
                        <span className={styles.washIcon}>✓</span>
                        <span className={styles.washLabel}>hecho</span>
                      </div>
                      <div className={`${styles.wash} ${styles.washNo}`} style={{ opacity: no }}>
                        <span className={styles.washIcon}>↩</span>
                        <span className={styles.washLabel}>luego</span>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      {phaseDone && (
        <div className={styles.ptrans} onClick={() => setPhaseDone(null)}>
          <div className={styles.ptCard} onClick={(e) => e.stopPropagation()}>
            <div
              className={styles.ptCheck}
              style={{ color: phaseDone.completed.color, borderColor: phaseDone.completed.color }}
            >
              ✓
            </div>
            <div className={styles.ptDone}>
              Completaste <b style={{ color: phaseDone.completed.color }}>{phaseDone.completed.name}</b>
            </div>
            <div className={styles.ptArrow}>↓</div>
            <div className={styles.ptNext}>
              <span className={styles.ptNextEye}>sigue</span>
              <span className={styles.ptNextName} style={{ color: phaseDone.next.color }}>
                <span className={styles.ptDot} style={{ background: phaseDone.next.color }} />
                {phaseDone.next.name}
              </span>
            </div>
            <button className={styles.ptBtn} onClick={() => setPhaseDone(null)}>
              seguir <span className={styles.mfsArr}>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
