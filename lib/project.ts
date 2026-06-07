/**
 * Tipos compartidos de la experiencia de onboarding por proyecto.
 *
 * El componente <ProjectExperience data={...}/> es universal: dibuja la data
 * que se le pase. Cada proyecto (mogos, amedi, …) define su propia data en
 * lib/<proyecto>.ts como un ProjectData — distinto contenido, mismo cascarón.
 */

export type Lens = 'que' | 'sistema' | 'arquitectura' | 'datos' | 'arranque';

/** Una app del monorepo (nodo del mapa de "El sistema"). */
export interface AppNode {
  id: string;
  emoji: string;
  name: string;
  sub: string;
  hub?: boolean;
  /** posición en el mapa, en % [x, y] */
  pos: [number, number];
  ess: string;
  qhace: string;
  conn: string[];
  files: [string, string][];
  run: string;
  repo: string;
}

/** Un tech del stack ("Arquitectura"). */
export interface Tech {
  id: string;
  emoji: string;
  name: string;
  layer: string;
  tag: string;
  ess: string;
  why: string;
  where: string;
  repo: string;
}

/** Una capa del stack. */
export interface Layer {
  id: string;
  k: string;
  items: string[];
  bone?: boolean;
}

/** Un modelo de datos dentro de un capítulo de "Los datos". */
export interface DataModel {
  emoji: string;
  name: string;
  table: string;
  one: string;
  fields: string[];
  links: string[];
  note?: string;
}

/** Un capítulo del recorrido de "Los datos". */
export interface DataChapter {
  id: string;
  n: string;
  title: string;
  kicker: string;
  lead: string;
  models: DataModel[];
}

/** La portada "Qué es". */
export interface ProjectOverview {
  kick: string;
  title: string;
  tag: string;
  ess: string;
  /** título de la sección de flujo, p.ej. "el recorrido de un paquete" */
  flowLabel: string;
  flow: { emoji: string; label: string; sub: string }[];
  who: { emoji: string; name: string; what: string }[];
  role: string;
}

/** Todo lo que el componente necesita para renderizar un proyecto. */
export interface ProjectData {
  /** url base del repo, con /tree/main */
  repo: string;
  /** identificador corto, p.ej. 'mogos' · 'amedi' (para migas y entrada) */
  slug: string;
  overview: ProjectOverview;
  apps: AppNode[];
  layers: Layer[];
  integ: string[];
  tech: Record<string, Tech>;
  scripts: [string, string][];
  docs: { emoji: string; name: string; path: string }[];
  data: DataChapter[];
  dataMore: string[];
  dataTotal: number;
  schemaFile: string;
  /** gancho del intro de "Los datos", p.ej. "de la ruta al paquete, del cobro al chat" */
  dataHook: string;
  /** chips "de un vistazo" en el sidebar de la portada */
  glance: string[];
  /** packages del monorepo (chips en el sidebar de "El sistema") */
  packages: string[];
  /** nombre del repo en git, p.ej. "mogos-group" */
  repoName: string;
  /** etiqueta de la bóveda de 1Password, p.ej. "mogos" */
  vault: string;
  /** línea de puertos en "Arranque", p.ej. "api :3000 · admin :3001 · …" */
  ports: string;
}

/** Construye un link al repo: con path → archivo; sin path → raíz. */
export const makeRepoUrl = (repo: string, path: string) =>
  path ? `${repo}/${path}` : repo.replace('/tree/main', '');
