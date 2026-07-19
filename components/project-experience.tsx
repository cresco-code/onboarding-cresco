'use client';

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { makeRepoUrl, type Lens, type AppNode, type ProjectData, type Tech } from '@/lib/project';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import styles from './project-experience.module.css';

/** Renderiza **negritas** simples dentro de un string. */
function rich(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** El recorrido, en orden. Cada lente entrega al siguiente. */
const LENS_ORDER: Lens[] = ['que', 'datos', 'arquitectura', 'sistema', 'arranque'];
const nextLens = (l: Lens): Lens | null => {
  const i = LENS_ORDER.indexOf(l);
  return i >= 0 && i < LENS_ORDER.length - 1 ? LENS_ORDER[i + 1] : null;
};
type Handoff = Record<Lens, { title: string; sub: string }>;
function NextCue({ to, onGo, handoff }: { to: Lens; onGo: (l: Lens) => void; handoff: Handoff }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const h = handoff[to];
  return (
    <div className={styles.introCta}>
      <div className={styles.t}><b>{h.title}</b><small>{h.sub}</small></div>
      <button className={styles.go} style={{ border: 'none', cursor: 'pointer' }} onClick={() => onGo(to)}>{ST.lensLabel[to]} →</button>
    </div>
  );
}

interface SearchItem { kind: 'app' | 'tech' | 'modelo' | 'script' | 'doc'; emoji: string; label: string; sub: string; go: () => void }

const VB = { w: 620, h: 510 };
const px = (p: [number, number]) => ({ x: (p[0] / 100) * VB.w, y: (p[1] / 100) * VB.h });

export function ProjectExperience({ data: dataEs, dataEn }: { data: ProjectData; dataEn?: ProjectData }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const data = locale === 'en' && dataEn ? dataEn : dataEs;
  const repoUrl = (p: string) => makeRepoUrl(data.repo, p);
  const [lens, setLens] = useState<Lens>('que');
  const [sel, setSel] = useState<string | null>(null); // app id (sistema) o tech id (arquitectura)
  const [read, setRead] = useState<Set<string>>(new Set());
  const [activeCh, setActiveCh] = useState(data.data[0]?.id ?? '');
  const [visited, setVisited] = useState<Set<Lens>>(new Set(['que']));
  const [palette, setPalette] = useState(false);

  const LS_READ = `${data.slug}_read`;
  const LS_VISITED = `${data.slug}_visited`;

  // progreso local (apps leídas + lentes visitados)
  useEffect(() => {
    try {
      const r = localStorage.getItem(LS_READ);
      if (r) setRead(new Set(JSON.parse(r)));
      const v = localStorage.getItem(LS_VISITED);
      if (v) setVisited((prev) => new Set([...prev, ...JSON.parse(v)]));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const markRead = (id: string) => {
    setRead((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try { localStorage.setItem(LS_READ, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  const markVisited = (l: Lens) => {
    setVisited((prev) => {
      if (prev.has(l)) return prev;
      const next = new Set(prev).add(l);
      try { localStorage.setItem(LS_VISITED, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const selApp = useMemo(() => data.apps.find((a) => a.id === sel) || null, [sel, data.apps]);
  const selTech = useMemo(() => (sel ? data.tech[sel] ?? null : null), [sel, data.tech]);

  function pickLens(l: Lens) { setLens(l); setSel(null); markVisited(l); }
  function selectApp(id: string) { setSel(id); markRead(id); }
  function selectTech(id: string) { setSel(id); }
  function close() { setSel(null); }

  const handoff: Handoff = {
    que: { title: '', sub: '' },
    datos: { title: ST.handoffDatosTitle, sub: ST.handoffDatosSub },
    arquitectura: { title: ST.handoffArqTitle, sub: ST.handoffArqSub },
    sistema: { title: ST.handoffSisTitle, sub: ST.handoffSisSub(data.apps.length) },
    arranque: { title: ST.handoffArrTitle, sub: ST.handoffArrSub },
  };

  // índice de búsqueda: apps · tech · modelos · scripts · docs
  const index = useMemo<SearchItem[]>(() => {
    const it: SearchItem[] = [];
    data.apps.forEach((a) => it.push({ kind: 'app', emoji: a.emoji, label: a.name, sub: a.sub, go: () => { pickLens('sistema'); selectApp(a.id); } }));
    Object.values(data.tech).forEach((t) => it.push({ kind: 'tech', emoji: t.emoji, label: t.name, sub: t.layer, go: () => { pickLens('arquitectura'); selectTech(t.id); } }));
    data.data.forEach((c) => c.models.forEach((m) => it.push({ kind: 'modelo', emoji: m.emoji, label: m.name, sub: m.table, go: () => { pickLens('datos'); setTimeout(() => document.getElementById(`data-ch-${c.id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 90); } })));
    data.scripts.forEach(([cmd]) => it.push({ kind: 'script', emoji: '⌘', label: cmd, sub: ST.firstBoot, go: () => pickLens('arranque') }));
    data.docs.forEach((d) => it.push({ kind: 'doc', emoji: d.emoji, label: d.name, sub: d.path, go: () => window.open(repoUrl(d.path), '_blank') }));
    return it;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, locale]);

  // teclado: ⌘K · ←/→ entre lentes · Esc cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((o) => !o); return; }
      if (palette) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { setSel(null); return; }
      if (e.key === 'ArrowRight') { const n = nextLens(lens); if (n) pickLens(n); }
      if (e.key === 'ArrowLeft') { const i = LENS_ORDER.indexOf(lens); if (i > 0) pickLens(LENS_ORDER[i - 1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette, lens]);

  const runItem = (item: SearchItem) => { setPalette(false); item.go(); };

  return (
    <div className={styles.app}>
      {/* topbar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.bdot} />
          <span className={styles.mk}>cresc&#333;<b>.</b></span>
          <span className={styles.sep}>onboarding · {data.slug}</span>
        </div>
        <div className={styles.modes}>
          {LENS_ORDER.map((l) => (
            <button key={l} className={`${styles.mode}${lens === l ? ' ' + styles.on : ''}`} onClick={() => pickLens(l)}>
              {ST.lensLabel[l]}
            </button>
          ))}
        </div>
        <div className={styles.journey}>
          <span className={styles.jcount}>{LENS_ORDER.indexOf(lens) + 1}/{LENS_ORDER.length}</span>
          <div className={styles.jdots}>
            {LENS_ORDER.map((l) => (
              <button
                key={l}
                className={`${styles.jdot}${lens === l ? ' ' + styles.jnow : visited.has(l) ? ' ' + styles.jseen : ''}`}
                onClick={() => pickLens(l)}
                title={ST.lensLabel[l]}
                aria-label={ST.lensLabel[l]}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.stage}>
        {/* sidebar */}
        <aside className={styles.side}>
          <button className={styles.search} onClick={() => setPalette(true)}>⌕ {ST.search} <span className={styles.k}>⌘K</span></button>
          {lens === 'que' && <SidebarIntro data={data} onGo={pickLens} />}
          {lens === 'sistema' && <SidebarSistema data={data} sel={sel} read={read} onPick={selectApp} onBack={close} />}
          {lens === 'arquitectura' && <SidebarArquitectura data={data} sel={sel} onPick={selectTech} onBack={close} />}
          {lens === 'datos' && <SidebarData data={data} active={activeCh} />}
          {lens === 'arranque' && <SidebarArranque />}
        </aside>

        {/* main */}
        <div className={styles.main}>
          {lens === 'que' && <CanvasIntro data={data} onGo={pickLens} handoff={handoff} />}
          {lens === 'sistema' && <CanvasSistema data={data} sel={sel} read={read} onSelect={selectApp} onGo={pickLens} />}
          {lens === 'arquitectura' && <CanvasArquitectura data={data} sel={sel} onSelect={selectTech} onGo={pickLens} handoff={handoff} />}
          {lens === 'datos' && <CanvasData data={data} onActive={setActiveCh} onGo={pickLens} handoff={handoff} />}
          {lens === 'arranque' && <CanvasArranque data={data} />}

          {/* reader */}
          <div className={`${styles.reader}${sel ? ' ' + styles.open : ''}`}>
            {selApp && <ReaderApp data={data} app={selApp} onClose={close} />}
            {selTech && <ReaderTech data={data} tech={selTech} onClose={close} />}
          </div>
        </div>
      </div>

      {palette && <Palette items={index} onClose={() => setPalette(false)} onRun={runItem} />}
    </div>
  );
}

/* ---------- ⌘K · command palette ---------- */
function Palette({ items, onClose, onRun }: { items: SearchItem[]; onClose: () => void; onRun: (i: SearchItem) => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => (i.label + ' ' + i.sub + ' ' + i.kind).toLowerCase().includes(s));
  }, [q, items]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setIdx(0); }, [q]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); const it = results[idx]; if (it) onRun(it); }
  };

  return (
    <div className={styles.palOverlay} onClick={onClose}>
      <div className={styles.palBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.palHead}>
          <span className={styles.palSearchIc}>⌕</span>
          <input
            ref={inputRef}
            className={styles.palIn}
            placeholder={ST.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <span className={styles.palEsc}>esc</span>
        </div>
        <div className={styles.palList}>
          {results.length === 0 && <div className={styles.palEmpty}>{ST.searchEmpty(q)}</div>}
          {results.map((it, i) => (
            <button
              key={it.kind + it.label}
              className={`${styles.palRow}${i === idx ? ' ' + styles.palOn : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => onRun(it)}
            >
              <span className={styles.palE}>{it.emoji}</span>
              <span className={styles.palLabel}>{it.label}</span>
              <span className={styles.palSub}>{it.sub}</span>
              <span className={styles.palKind}>{ST.kindLabel[it.kind]}</span>
            </button>
          ))}
        </div>
        <div className={styles.palFoot}><span>{ST.palMove}</span><span>{ST.palGo}</span><span>{ST.palClose}</span></div>
      </div>
    </div>
  );
}

/* ---------- qué es · portada ---------- */
function CanvasIntro({ data, onGo, handoff }: { data: ProjectData; onGo: (l: Lens) => void; handoff: Handoff }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const o = data.overview;
  return (
    <div className={`${styles.canvas} ${styles.canvasIntro}`}>
      <div className={styles.intro}>
        <div className={styles.introKick}>{o.kick}</div>
        <h1 className={styles.introTitle}>{o.title}</h1>
        <div className={styles.introTag}>{o.tag}</div>
        <p className={styles.introEss}>{rich(o.ess)}</p>

        <div className={styles.introLbl}>{o.flowLabel}</div>
        <div className={styles.flow}>
          {o.flow.map((s, i) => (
            <Fragment key={s.label}>
              <div className={styles.flowStep}>
                <div className={styles.fEmoji}>{s.emoji}</div>
                <div className={styles.fLabel}>{s.label}</div>
                <div className={styles.fSub}>{s.sub}</div>
              </div>
              {i < o.flow.length - 1 && <div className={styles.fArrow}>→</div>}
            </Fragment>
          ))}
        </div>

        <div className={styles.introLbl}>{ST.whoUses}</div>
        <div className={styles.who}>
          {o.who.map((w) => (
            <div key={w.name} className={styles.whoCard}>
              <span className={styles.e}>{w.emoji}</span>
              <div><div className={styles.n}>{w.name}</div><div className={styles.w}>{w.what}</div></div>
            </div>
          ))}
        </div>

        <div className={styles.introLbl}>{ST.crescoRole}</div>
        <div className={styles.role}><span className={styles.ic}>🌱</span><p>{o.role}</p></div>

        <NextCue to={nextLens('que')!} onGo={onGo} handoff={handoff} />
      </div>
    </div>
  );
}
function SidebarIntro({ data, onGo }: { data: ProjectData; onGo: (l: Lens) => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const icons: Record<Lens, string> = { que: '◉', datos: '◈', arquitectura: '▤', sistema: '◍', arranque: '🟢' };
  return (
    <>
      <div className={styles.rl}>{ST.theJourney}</div>
      {LENS_ORDER.map((l) => (
        <button key={l} className={`${styles.navi}${l === 'que' ? ' ' + styles.on : ''}`} onClick={() => onGo(l)}>
          <span className={styles.e}>{icons[l]}</span> {ST.lensLabel[l]}
        </button>
      ))}
      <div className={styles.rl}>{ST.atAGlance}</div>
      <div className={styles.pkrow}>{data.glance.map((p) => <span key={p} className={styles.pk}>{p}</span>)}</div>
    </>
  );
}

/* ---------- sistema ---------- */
function CanvasSistema({ data, sel, read, onSelect, onGo }: { data: ProjectData; sel: string | null; read: Set<string>; onSelect: (id: string) => void; onGo: (l: Lens) => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const apps = data.apps;
  const hub = apps.find((a) => a.hub);
  const next = nextLens('sistema')!;
  return (
    <div className={`${styles.canvas} ${styles.canvasMap}`}>
      <div className={styles.mapbox}>
        {hub && (
          <div className={styles.lines}>
            <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none">
              {apps.filter((a) => !a.hub).map((a) => {
                const h = px(hub.pos), p = px(a.pos);
                const cls = sel ? (sel === a.id ? styles.hot : sel !== hub.id ? styles.dim : '') : '';
                return <path key={a.id} d={`M${h.x},${h.y} L${p.x},${p.y}`} className={cls} />;
              })}
            </svg>
          </div>
        )}
        {apps.map((a) => {
          const dim = sel && hub && sel !== hub.id && a.id !== sel && a.id !== hub.id;
          const cls = [styles.node, a.hub ? styles.hub : '', sel === a.id ? styles.sel : '', dim ? styles.dim : '', read.has(a.id) ? styles.done : ''].filter(Boolean).join(' ');
          return (
            <button key={a.id} className={cls} style={{ left: `${a.pos[0]}%`, top: `${a.pos[1]}%` }} onClick={() => onSelect(a.id)}>
              <span className={styles.nodeB}>{a.emoji}{read.has(a.id) && <span className={styles.nbadge}>✓</span>}</span>
              <span className={styles.nodeNm}>{a.name}</span>
            </button>
          );
        })}
        <div className={styles.hint}>{ST.hintConnected(data.slug)} · <b>{ST.hintTapNode}</b><br />{ST.hintSidebarMoves}</div>
      </div>
      <button className={styles.mapNext} onClick={() => onGo(next)}>{ST.next} · {ST.lensLabel[next]} →</button>
    </div>
  );
}
function SidebarSistema({ data, sel, read, onPick, onBack }: { data: ProjectData; sel: string | null; read: Set<string>; onPick: (id: string) => void; onBack: () => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const apps = data.apps;
  const app = apps.find((a) => a.id === sel);
  if (!app) return (
    <>
      <div className={styles.rl}>{ST.theSystem}</div>
      {apps.map((a) => (
        <button key={a.id} className={`${styles.navi}${read.has(a.id) ? ' ' + styles.done : ''}`} onClick={() => onPick(a.id)}>
          <span className={styles.e}>{a.emoji}</span> {a.name}<span className={styles.nvdot} />
        </button>
      ))}
      <div className={styles.rl}>{ST.packages}</div>
      <div className={styles.pkrow}>{data.packages.map((p) => <span key={p} className={styles.pk}>{p}</span>)}</div>
    </>
  );
  return (
    <>
      <button className={styles.back} onClick={onBack}>{ST.back}</button>
      <div className={styles.ctxbig}><span className={styles.e}>{app.emoji}</span><span className={styles.n}>{app.name}</span></div>
      <div className={styles.ctxtag}>{app.sub}</div>
      <div className={styles.rl}>{ST.jumpToApp}</div>
      {apps.filter((a) => a.id !== app.id).map((a) => (
        <button key={a.id} className={styles.navi} onClick={() => onPick(a.id)}><span className={styles.e}>{a.emoji}</span> {a.name}</button>
      ))}
    </>
  );
}
function ReaderApp({ data, app, onClose }: { data: ProjectData; app: AppNode; onClose: () => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const repoUrl = (p: string) => makeRepoUrl(data.repo, p);
  return (
    <div className={styles.rd}>
      <div className={styles.rdCrumb}>{data.slug} / {ST.theSystem} / <b>{app.name}</b><button className={styles.rdClose} onClick={onClose}>✕</button></div>
      <div className={styles.rdHh}><div className={styles.rdHi}>{app.emoji}</div><div><h1>{app.name}</h1><div className={styles.rdSub}>{app.sub}</div></div></div>
      <p className={styles.b2} style={{ marginTop: 8 }}>{rich(app.ess)}</p>
      <div className={styles.rdLbl}>{ST.whatItDoes}</div><p className={styles.b2}>{rich(app.qhace)}</p>
      <div className={styles.rdLbl}>{ST.howItFits}</div><div className={styles.conn}>{app.conn.map((c, i) => <span key={i} className={styles.connT}>{c}</span>)}</div>
      <div className={styles.rdLbl}>{ST.whatToRead}</div>
      <div className={styles.files}>{app.files.map((f, i) => (
        <a key={i} className={styles.fl} href={repoUrl(f[0])} target="_blank" rel="noreferrer"><div className={styles.p}>{f[0]} ↗</div><div className={styles.d}>{f[1]}</div></a>
      ))}</div>
      <div className={styles.rdLbl}>{ST.runIt}</div><div className={styles.code}>{app.run}</div>
      <div className={styles.exit}>
        <div className={styles.t}>{ST.exitUnderstood}</div>
        <div className={styles.s}>{ST.exitMentalMap(app.name)}</div>
        <a className={styles.go} href={repoUrl(app.repo)} target="_blank" rel="noreferrer">{ST.open} <span className={styles.mono}>{app.repo}</span> ↗</a>
      </div>
    </div>
  );
}

/* ---------- arquitectura ---------- */
function CanvasArquitectura({ data, sel, onSelect, onGo, handoff }: { data: ProjectData; sel: string | null; onSelect: (id: string) => void; onGo: (l: Lens) => void; handoff: Handoff }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const { layers, integ, tech } = data;
  return (
    <div className={`${styles.canvas} ${styles.canvasStack}`}>
      <div className={styles.archlegend}>
        <span>{rich(ST.archLegend1)}</span>
        <span>{rich(ST.archLegend2)}</span>
      </div>
      <div className={styles.stack}>
        {layers.map((L, i) => (
          <Fragment key={L.id}>
            <div className={styles.layerwrap}>
              <div className={`${styles.layer}${L.bone ? ' ' + styles.bone : ''}`}>
                <div className={styles.lh}><span className={styles.n}>{L.id}</span><span className={styles.k}>{L.k}</span></div>
                <div className={styles.chips}>{L.items.map((id) => tech[id] && <Chip key={id} tech={tech[id]} sel={sel} onSelect={onSelect} />)}</div>
              </div>
              {i === 0 && integ.length > 0 ? (
                <div className={styles.raili}>
                  <div className={styles.lh2}>{ST.integrations}</div>
                  {integ.map((id) => tech[id] && <Chip key={id} tech={tech[id]} sel={sel} onSelect={onSelect} />)}
                </div>
              ) : <div />}
            </div>
            {i < layers.length - 1 && (
              <div className={styles.layerwrap}><div className={styles.flowdown}>↓<small>{ST.talksTo}</small></div><div /></div>
            )}
          </Fragment>
        ))}
      </div>
      <div className={styles.stackNext}><NextCue to={nextLens('arquitectura')!} onGo={onGo} handoff={handoff} /></div>
    </div>
  );
}
function Chip({ tech, sel, onSelect }: { tech: Tech; sel: string | null; onSelect: (id: string) => void }) {
  return (
    <button className={`${styles.chip}${sel === tech.id ? ' ' + styles.sel : ''}`} title={tech.where} onClick={() => onSelect(tech.id)}>
      <span className={styles.e}>{tech.emoji}</span>{tech.name}<span className={styles.ct}>{tech.tag.split(' · ')[0]}</span>
    </button>
  );
}
function SidebarArquitectura({ data, sel, onPick, onBack }: { data: ProjectData; sel: string | null; onPick: (id: string) => void; onBack: () => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const { layers, tech } = data;
  const t = sel ? tech[sel] : null;
  if (!t) return (
    <>
      <div className={styles.rl}>{ST.layers}</div>
      {layers.map((L) => <div key={L.id} className={styles.navi} style={{ cursor: 'default' }}><span className={styles.e}>▤</span> {L.id}</div>)}
      <div className={styles.rl}>{ST.wholeStack}</div>
      {Object.values(tech).map((x) => <button key={x.id} className={styles.navi} onClick={() => onPick(x.id)}><span className={styles.e}>{x.emoji}</span> {x.name}</button>)}
    </>
  );
  const sib = Object.values(tech).filter((x) => x.layer === t.layer && x.id !== t.id);
  return (
    <>
      <button className={styles.back} onClick={onBack}>{ST.backToStack}</button>
      <div className={styles.ctxbig}><span className={styles.e}>{t.emoji}</span><span className={styles.n}>{t.name}</span></div>
      <div className={styles.ctxtag}>{ST.layer} · {t.layer}</div>
      {sib.length > 0 && <><div className={styles.rl}>{ST.sameLayer}</div>{sib.map((x) => <button key={x.id} className={styles.navi} onClick={() => onPick(x.id)}><span className={styles.e}>{x.emoji}</span> {x.name}</button>)}</>}
    </>
  );
}
function ReaderTech({ data, tech, onClose }: { data: ProjectData; tech: Tech; onClose: () => void }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const repoUrl = (p: string) => makeRepoUrl(data.repo, p);
  return (
    <div className={styles.rd}>
      <div className={styles.rdCrumb}>{data.slug} / {ST.lensLabel.arquitectura} / <b>{tech.name}</b><button className={styles.rdClose} onClick={onClose}>✕</button></div>
      <div className={styles.rdHh}><div className={styles.rdHi}>{tech.emoji}</div><div><h1>{tech.name}</h1><div className={styles.rdSub}>{ST.layer} · {tech.layer} · {tech.tag}</div></div></div>
      <div className={styles.rdLbl}>{ST.whatIsIt}</div><p className={styles.b2}>{rich(tech.ess)}</p>
      <div className={styles.rdLbl}>{ST.whyIn(data.slug)}</div><p className={styles.b2}>{rich(tech.why)}</p>
      <div className={styles.rdLbl}>{ST.whereItLives}</div><div className={styles.where}>{tech.where}</div>
      {tech.repo && (
        <div className={styles.exit}>
          <div className={styles.t}>{ST.goToCode}</div><div className={styles.s}>{ST.openInRepo(data.slug)}</div>
          <a className={styles.go} href={repoUrl(tech.repo)} target="_blank" rel="noreferrer">{ST.open} <span className={styles.mono}>{tech.repo}</span> ↗</a>
        </div>
      )}
    </div>
  );
}

/* ---------- los datos · recorrido ---------- */
function CanvasData({ data, onActive, onGo, handoff }: { data: ProjectData; onActive: (id: string) => void; onGo: (l: Lens) => void; handoff: Handoff }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const repoUrl = (p: string) => makeRepoUrl(data.repo, p);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const secs = Array.from(root.querySelectorAll('[data-ch]'));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = vis[0]?.target.getAttribute('data-ch');
        if (id) onActive(id);
      },
      { root, rootMargin: '-12% 0px -68% 0px', threshold: 0 },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onActive]);

  return (
    <div className={`${styles.canvas} ${styles.canvasData}`} ref={ref}>
      <div className={styles.dataWrap}>
        <div className={styles.dataIntro}>
          <div className={styles.dataKick}>{ST.dataModel}</div>
          <h1>{ST.dataModelTitle}</h1>
          <p>{ST.dataIntro(data.slug, data.dataTotal, data.dataHook)}</p>
          <div className={styles.dataStat}><span>{ST.dataStat1(data.dataTotal)}</span><span>{ST.dataStat2}</span><span>{ST.dataStat3}</span></div>
          <div className={styles.dataScrollHint}>{ST.dataScrollHint}</div>
        </div>

        {data.data.map((c) => (
          <section key={c.id} id={`data-ch-${c.id}`} data-ch={c.id} className={styles.chapter}>
            <div className={styles.chHead}>
              <div><span className={styles.chNum}>{c.n}</span><span className={styles.chKick}>{c.kicker}</span></div>
              <div className={styles.chTitle}>{c.title}</div>
              <p className={styles.chLead}>{rich(c.lead)}</p>
            </div>
            <div className={styles.chain}>
              {c.models.map((m) => (
                <div key={m.name} className={styles.mdl}>
                  <div className={styles.mdlIc}>{m.emoji}</div>
                  <div className={styles.mdlMain}>
                    <div className={styles.mdlTop}><span className={styles.mdlName}>{m.name}</span><span className={styles.mdlTable}>{m.table}</span></div>
                    <div className={styles.mdlOne}>{m.one}</div>
                    <div className={styles.mdlFields}>{m.fields.map((f, i) => <span key={i} className={styles.mf}>{f}</span>)}</div>
                    <div className={styles.mdlLinks}>{m.links.map((l, i) => <span key={i} className={styles.ml}>{l}</span>)}</div>
                    {m.note && <div className={styles.mdlNote}><p>{m.note}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className={styles.dataMore}>
          <div className={styles.lbl}>{ST.dataMoreLbl}</div>
          <h3>{ST.dataMoreTitle}</h3>
          <p>{ST.dataMoreBody(data.dataTotal)}</p>
          <div className={styles.moreChips}>{data.dataMore.map((x) => <span key={x} className={styles.moreChip}>{x}</span>)}</div>
          <div className={styles.dataGo}>
            <a href={repoUrl(data.schemaFile)} target="_blank" rel="noreferrer">{ST.readFullSchema} <span className={styles.mono2}>{data.schemaFile}</span> ↗</a>
          </div>
        </div>

        <NextCue to={nextLens('datos')!} onGo={onGo} handoff={handoff} />
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
function SidebarData({ data, active }: { data: ProjectData; active: string }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const jump = (id: string) => document.getElementById(`data-ch-${id}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return (
    <>
      <div className={styles.rl}>{ST.chapters}</div>
      {data.data.map((c) => (
        <button key={c.id} className={`${styles.chap}${active === c.id ? ' ' + styles.on : ''}`} onClick={() => jump(c.id)}>
          <span className={styles.cn}>{c.n}</span> {c.title}
        </button>
      ))}
      <div className={styles.rl}>{ST.atAGlance}</div>
      <div className={styles.pkrow}>{[ST.dataStat1(data.dataTotal), 'Prisma', 'Postgres'].map((p) => <span key={p} className={styles.pk}>{p}</span>)}</div>
    </>
  );
}

/* ---------- arranque ---------- */
function SidebarArranque() {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  return (
    <>
      <div className={styles.rl}>{ST.dayZero}</div>
      <div className={styles.navi}><span className={styles.e}>🔑</span> {ST.access}</div>
      <div className={`${styles.navi} ${styles.on}`}><span className={styles.e}>🟢</span> {ST.firstBoot}</div>
      <div className={styles.rl}>{ST.onThisPage}</div>
      {ST.bootItems.map((x) => <div key={x} className={styles.navi} style={{ cursor: 'default', fontSize: 12 }}><span className={styles.e}>◦</span> {x}</div>)}
    </>
  );
}
function CanvasArranque({ data }: { data: ProjectData }) {
  const { locale } = useLocale();
  const ST = strings(locale).project;
  const repoUrl = (p: string) => makeRepoUrl(data.repo, p);
  return (
    <div className={`${styles.canvas} ${styles.canvasDoc}`}>
      <div className={styles.doc}>
        <div className={styles.docCrumb}>{data.slug} / {ST.bootCrumb} / <b>{ST.firstBoot}</b></div>
        <div className={styles.docHrow}><div className={styles.docIc}>🟢</div><h1>{ST.bootTitle}</h1></div>
        <p className={styles.docEss}>{rich(ST.bootEss)}</p>

        <div className={styles.docSec}>
          <div className={styles.docLbl}>{ST.reqLbl}</div>
          <p className="soft" style={{ color: 'var(--ink-soft)' }}>{rich(ST.reqBody(data.repoName))}</p>
        </div>

        <div className={styles.docSec}>
          <div className={styles.docLbl}>{ST.envLbl}</div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.66 }}>{rich(ST.envBody(data.vault))}</p>
          <div className={styles.cl}><span className={styles.ic}>🔐</span><p>{rich(ST.envHow(data.vault))}</p></div>
          <div className={`${styles.cl} ${styles.warn}`} style={{ marginTop: 8 }}><span className={styles.ic}>⚠️</span><p>{rich(ST.envWarn)}</p></div>
        </div>

        <div className={styles.docSec}>
          <div className={styles.docLbl}>{ST.switchEnvLbl}</div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.66 }}>{ST.switchEnvBody}</p>
          <div className={styles.code}><span className={styles.c}>{ST.switchEnvComment}</span>{'\n'}bash scripts/switch-env.sh dev <span className={styles.g}>{ST.switchEnvDevComment}</span></div>
        </div>

        <div className={styles.docSec}>
          <div className={styles.docLbl}>{ST.startLbl}</div>
          <div className={styles.code}><span className={styles.c}>{ST.installComment}</span>{'\n'}npm install{'\n\n'}<span className={styles.c}>{ST.devComment}</span>{'\n'}npm run dev <span className={styles.g}>{ST.devSubComment}</span></div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.66, marginTop: 14 }}>{rich(ST.modesBody)}</p>
          <div className={styles.scripts}>{data.scripts.map(([cmd, d]) => (
            <div key={cmd} className={styles.scr}><span className={styles.cmd}>{cmd}</span><span className={styles.d}>{rich(d)}</span></div>
          ))}</div>
          <div className={styles.cl} style={{ marginTop: 12 }}><span className={styles.ic}>🌱</span><p>{rich(ST.portsBody(data.ports))}</p></div>
        </div>

        <div className={styles.docSec}>
          <div className={styles.docLbl}>{ST.docsLbl}</div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 14 }}>{ST.docsBody}</p>
          <div className={styles.docs}>{data.docs.map((d) => (
            <a key={d.path} className={styles.dl} href={repoUrl(d.path)} target="_blank" rel="noreferrer"><span className={styles.e}>{d.emoji}</span><span className={styles.nm}>{d.name}<small>{d.path}</small></span><span className={styles.ar}>↗</span></a>
          ))}</div>
        </div>

        <div className={styles.exit} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 40 }}>
          <div style={{ flex: 1 }}><div className={styles.t}>{ST.exitFull(data.slug)}</div><div className={styles.s}>{ST.exitFullSub}</div></div>
          <a className={styles.go} href={repoUrl('')} target="_blank" rel="noreferrer">{ST.openRepo} ↗</a>
        </div>
      </div>
    </div>
  );
}
