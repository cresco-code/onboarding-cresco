import { Client } from '@notionhq/client';
import type { CBlock } from './notion-content';
import type { Locale } from './i18n/locale';
import { TASK_BODY_EN } from './i18n/task-body-en';

const NOTION_TOKEN = process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY;
const TASKS_DATA_SOURCE_ID =
  process.env.NOTION_TASKS_DATA_SOURCE_ID ?? '26f8af9a-4f71-8148-be25-000bc78c22dc';
const DESIGN = process.env.NEXT_PUBLIC_DESIGN_URL ?? 'https://cresco-design.pages.dev';
const ONBOARDING_TYPE = '🚀 Onboarding';
const DONE_STATES = ['Done', 'Archived'];
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface OnbItem {
  id: string;
  /** nombre de la tarea — viene de Notion (Task name) */
  name: string;
  /** descripción corta — viene de Notion (Description) */
  blurb: string;
  kind: 'action' | 'read';
  done: boolean;
  source: 'notion' | 'default';
  /** read: URL que se embebe en el lector dentro de la página (enriquecimiento de código) */
  embedUrl?: string;
  readMins?: number;
  /** action: pasos + CTA (enriquecimiento de código) */
  steps?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  /** id de la Task en Notion para persistir el Status */
  notionId?: string;
}

/**
 * Plantilla del onboarding estándar de crescō.
 *
 * IMPORTANTE: esto NO es la fuente de lo que se muestra. Notion lo es.
 * Este arreglo solo se usa para dos cosas:
 *   1) SEMBRAR las tareas en Notion la primera vez (name + description).
 *   2) ENRIQUECER la UX por nombre (kind/embed/steps/CTA) — detalles técnicos
 *      de cómo se renderiza cada tarea, que no tiene sentido editar en Notion.
 *
 * El nombre, la descripción y el estado SIEMPRE vienen de Notion. Si editas,
 * agregas o borras una tarea 🚀 Onboarding en Notion, el home lo refleja.
 * Si una tarea de Notion no matchea por nombre con esta plantilla, igual se
 * muestra (como acción simple): nombre + descripción + marcar como hecho.
 */
interface SeedItem {
  name: string;
  description: string;
  kind: 'action' | 'read';
  embedUrl?: string;
  readMins?: number;
  steps?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  /** traducción de UI (código, no vive en Notion) — ver lib/i18n/task-body-en.ts para el cuerpo */
  nameEn?: string;
  descriptionEn?: string;
}

const ONBOARDING: SeedItem[] = [
  {
    name: 'Acepta tu Google Workspace',
    description: 'Tu cuenta @cresco.so es tu llave a todo lo demás. Empieza por aquí.',
    kind: 'action',
    steps: [
      'Abre el correo de invitación que te llegó',
      'Acepta y crea tu contraseña',
      'Confirma que entras a Gmail con tu @cresco.so',
    ],
    ctaLabel: 'Abrir Gmail',
    ctaUrl: 'https://mail.google.com',
    nameEn: 'Accept your Google Workspace',
    descriptionEn: 'Your @cresco.so account is the key to everything else. Start here.',
  },
  {
    name: 'Entra a Slack con tu correo',
    description: 'Slack es donde conversa el equipo. Cada cliente y proyecto tiene su canal.',
    kind: 'action',
    steps: ['Abre Slack e inicia sesión con tu correo @cresco.so', 'Activa las notificaciones', 'Preséntate en #general'],
    ctaLabel: 'Abrir Slack',
    ctaUrl: 'https://slack.com/signin',
    nameEn: 'Sign in to Slack with your email',
    descriptionEn: 'Slack is where the team talks. Every client and project has its own channel.',
  },
  {
    name: 'Entra a Notion con tu correo',
    description: 'Notion es la memoria del estudio: proyectos, tareas, reuniones y wiki.',
    kind: 'action',
    steps: ['Abre Notion e inicia sesión con Google (@cresco.so)', 'Acepta la invitación al workspace de crescō', 'Encuentra el HQ del estudio'],
    ctaLabel: 'Abrir Notion',
    ctaUrl: 'https://notion.so',
    nameEn: 'Sign in to Notion with your email',
    descriptionEn: "Notion is the studio's memory: projects, tasks, meetings and wiki.",
  },
  {
    name: 'Configura GitHub',
    description: 'Tu acceso al código del estudio: únete a la organización y asegura tu cuenta.',
    kind: 'action',
    nameEn: 'Set up GitHub',
    descriptionEn: 'Your access to the studio’s code: join the organization and secure your account.',
  },
  {
    name: 'Configura el repo de tu cliente',
    description: 'Clona el proyecto en el que vas a trabajar y levántalo en tu máquina.',
    kind: 'action',
    nameEn: "Set up your client's repo",
    descriptionEn: "Clone the project you'll be working on and get it running on your machine.",
  },
  {
    name: 'Instala Claude Code',
    description: 'La terminal de IA con la que trabajamos: corre los skills y agentes del estudio.',
    kind: 'action',
    nameEn: 'Install Claude Code',
    descriptionEn: "The AI terminal we work with: runs the studio's skills and agents.",
  },
  {
    name: 'Conecta tus conectores en Notion',
    description: 'Conecta Google Calendar, Slack, GitHub y Gmail a Notion para que todo se cruce.',
    kind: 'action',
    nameEn: 'Connect your connectors in Notion',
    descriptionEn: 'Connect Google Calendar, Slack, GitHub and Gmail to Notion so everything ties together.',
  },
  {
    name: 'Conoce el stack: con qué construimos',
    description: 'El monorepo de crescō: Next, Expo, NestJS, Prisma, Supabase, Render, DigitalOcean.',
    kind: 'read',
    embedUrl: `${DESIGN}/stack/`,
    readMins: 4,
    nameEn: 'Know the stack: what we build with',
    descriptionEn: "crescō's monorepo: Next, Expo, NestJS, Prisma, Supabase, Render, DigitalOcean.",
  },
  {
    name: 'Lee la metodología de crescō',
    description: 'Cómo trabajamos: de la reunión a la ejecución. La AI propone, las personas deciden.',
    kind: 'read',
    embedUrl: `${DESIGN}/metodologia/`,
    readMins: 4,
    nameEn: "Read crescō's methodology",
    descriptionEn: 'How we work: from the meeting to execution. AI proposes, people decide.',
  },
  {
    name: 'Conoce tu día a día: My Work y el triage',
    description: 'Tu tablero personal y los botones Approve, Reject y Convert into Project.',
    kind: 'read',
    embedUrl: `${DESIGN}/mi-trabajo/`,
    readMins: 3,
    nameEn: 'Know your day to day: My Work and triage',
    descriptionEn: 'Your personal board and the Approve, Reject and Convert into Project buttons.',
  },
  {
    name: 'Entiende el sistema: teamspace y la base Tasks',
    description: 'El teamspace all crescō y la base Tasks: sus relaciones y el ciclo de vida.',
    kind: 'read',
    embedUrl: `${DESIGN}/sistema-tareas/`,
    readMins: 4,
    nameEn: 'Understand the system: the teamspace and the Tasks base',
    descriptionEn: 'The crescō teamspace and the Tasks base: their relationships and lifecycle.',
  },
  {
    name: 'Conoce el workspace',
    description: 'El mapa de Notion: las áreas del estudio y las seis bases que sostienen todo.',
    kind: 'read',
    embedUrl: `${DESIGN}/hq/`,
    readMins: 3,
    nameEn: 'Know the workspace',
    descriptionEn: "The Notion map: the studio's areas and the six bases that hold everything together.",
  },
  {
    name: 'crescō skills: la fábrica del equipo',
    description: 'Qué son los skills, cómo instalarlos y cómo crear los tuyos.',
    kind: 'read',
    readMins: 4,
    nameEn: 'crescō skills: the team factory',
    descriptionEn: 'What skills are, how to install them, and how to build your own.',
  },
  {
    name: 'El sistema operativo del estudio',
    description: 'Las tres capas —homes, skills y agentes— sobre las seis bases de Notion.',
    kind: 'read',
    readMins: 3,
    nameEn: "The studio's operating system",
    descriptionEn: 'The three layers — homes, skills, and agents — sitting on top of Notion’s six bases.',
  },
  {
    name: 'Graba tu primera reunión',
    description: 'Cómo documentamos: cada reunión se graba y se transcribe en Notion.',
    kind: 'action',
    nameEn: 'Record your first meeting',
    descriptionEn: 'How we document: every meeting is recorded and transcribed in Notion.',
  },
  {
    name: 'Conoce a tu cliente y proyecto',
    description: 'Abre tu proyecto en Notion y empápate del contexto antes de construir.',
    kind: 'action',
    nameEn: 'Get to know your client and project',
    descriptionEn: 'Open your project in Notion and soak up the context before you start building.',
  },
  {
    name: 'Agarra tu primera tarea',
    description: 'Toma algo del backlog, asígnatela y muévela a in progress. A construir.',
    kind: 'action',
    nameEn: 'Grab your first task',
    descriptionEn: 'Grab something from the backlog, assign it to yourself, and move it to in progress. Time to build.',
  },
];

/** Las fases del onboarding — agrupan las tareas con un color, para no abrumar con "1 de 13". */
export interface Phase {
  key: string;
  name: string;
  nameEn: string;
  color: string;
}
export const PHASES: Phase[] = [
  { key: 'accesos', name: 'Accesos', nameEn: 'Access', color: '#5A6B4E' },
  { key: 'herramientas', name: 'Herramientas', nameEn: 'Tools', color: '#A8755A' },
  { key: 'aprende', name: 'Cómo trabajamos', nameEn: 'How we work', color: '#5B6E7A' },
  { key: 'reuniones', name: 'Reuniones', nameEn: 'Meetings', color: '#B08A4F' },
  { key: 'primeros', name: 'Primeros pasos', nameEn: 'First steps', color: '#9A6B5E' },
];
/** nombre de la fase en el idioma pedido */
export function phaseName(phase: Phase, locale: Locale): string {
  return locale === 'en' ? phase.nameEn : phase.name;
}
const PHASE_OF: Record<string, string> = {
  'Acepta tu Google Workspace': 'accesos',
  'Entra a Slack con tu correo': 'accesos',
  'Entra a Notion con tu correo': 'accesos',
  'Configura GitHub': 'herramientas',
  'Configura el repo de tu cliente': 'herramientas',
  'Instala Claude Code': 'herramientas',
  'Conecta tus conectores en Notion': 'herramientas',
  'Conoce el stack: con qué construimos': 'herramientas',
  'Lee la metodología de crescō': 'aprende',
  'Conoce tu día a día: My Work y el triage': 'aprende',
  'Entiende el sistema: teamspace y la base Tasks': 'aprende',
  'Conoce el workspace': 'aprende',
  'crescō skills: la fábrica del equipo': 'aprende',
  'El sistema operativo del estudio': 'aprende',
  'Graba tu primera reunión': 'reuniones',
  'Conoce a tu cliente y proyecto': 'primeros',
  'Agarra tu primera tarea': 'primeros',
};
/** La fase de una tarea (por nombre). Cae a "Primeros pasos" si no matchea. */
export function phaseOf(name: string): Phase {
  const key = PHASE_OF[name.trim()] ?? 'primeros';
  return PHASES.find((p) => p.key === key) ?? PHASES[PHASES.length - 1];
}

const notion = () => new Client({ auth: NOTION_TOKEN });
const norm = (s: string) => s.trim().toLowerCase();

/**
 * Traduce nombre + descripción de una tarea al inglés (código, no Notion).
 * Si la tarea no matchea la plantilla (extra creada a mano en Notion), se
 * muestra tal cual quedó en Notion — igual que hace enrich() con el resto.
 */
export function translateTask(item: OnbItem, locale: Locale): OnbItem {
  if (locale !== 'en') return item;
  const m = ONBOARDING.find((o) => norm(o.name) === norm(item.name));
  if (!m?.nameEn) return item;
  return { ...item, name: m.nameEn, blurb: m.descriptionEn ?? item.blurb };
}

/** cuerpo en inglés de una tarea de la plantilla, si existe (ver lib/i18n/task-body-en.ts) */
export function translatedBody(name: string, locale: Locale): CBlock[] | undefined {
  if (locale !== 'en') return undefined;
  return TASK_BODY_EN[norm(name)];
}

/** UX por nombre: lo técnico (kind/embed/steps/CTA) que no vive en Notion */
function enrich(name: string): Omit<SeedItem, 'name' | 'description'> {
  const m = ONBOARDING.find((o) => norm(o.name) === norm(name));
  if (!m) return { kind: 'action' };
  const { name: _n, description: _d, ...ux } = m;
  return ux;
}

/** Convierte la plantilla en items de preview (sin Notion, solo lectura local) */
function templatePreview(): OnbItem[] {
  return ONBOARDING.map((o) => ({
    id: o.name,
    name: o.name,
    blurb: o.description,
    done: false,
    source: 'default',
    kind: o.kind,
    embedUrl: o.embedUrl,
    readMins: o.readMins,
    steps: o.steps,
    ctaLabel: o.ctaLabel,
    ctaUrl: o.ctaUrl,
  }));
}

interface RawTask {
  id: string;
  name: string;
  description: string;
  done: boolean;
}

/** lee las Tasks 🚀 Onboarding de la persona (nombre + descripción + estado, todo de Notion) */
async function queryOnboarding(teamPageId: string): Promise<RawTask[]> {
  const res = await notion().dataSources.query({
    data_source_id: TASKS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: 'Type', select: { equals: ONBOARDING_TYPE } },
        { property: 'Team', relation: { contains: teamPageId } },
      ],
    },
    sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
    page_size: 50,
  });
  return res.results.flatMap((p) => {
    if (!('properties' in p)) return [];
    const props = p.properties as Record<string, unknown>;
    const title = props['Task name'] as { title?: { plain_text: string }[] } | undefined;
    const desc = props['Description'] as { rich_text?: { plain_text: string }[] } | undefined;
    const status = props['Status'] as { status?: { name: string } | null } | undefined;
    return [{
      id: p.id,
      name: title?.title?.map((t) => t.plain_text).join('') || '',
      description: desc?.rich_text?.map((t) => t.plain_text).join('') || '',
      done: DONE_STATES.includes(status?.status?.name ?? ''),
    }];
  });
}

/** crea una Task 🚀 Onboarding en Notion (name + description) asignada a la persona */
async function createOnboardingTask(item: SeedItem, teamPageId: string): Promise<void> {
  await notion().pages.create({
    parent: { type: 'data_source_id', data_source_id: TASKS_DATA_SOURCE_ID },
    properties: {
      'Task name': { title: [{ text: { content: item.name } }] },
      Description: { rich_text: [{ text: { content: item.description } }] },
      Type: { select: { name: ONBOARDING_TYPE } },
      Team: { relation: [{ id: teamPageId }] },
      Status: { status: { name: 'Not Started' } },
    },
  });
}

/**
 * El onboarding de la persona, leído de Notion (fuente de verdad).
 * - name + blurb + estado vienen de Notion (editables ahí, bidireccional).
 * - kind/embed/steps/CTA se enriquecen por nombre desde la plantilla de código.
 * - Si nunca tuvo tareas, se siembran las estándar en Notion una sola vez.
 */
/** error null = ok; 'no-team' = logueado pero sin registro en Team; 'notion' = falló la lectura de Notion */
export type OnboardingError = 'no-team' | 'notion' | null;
export interface OnboardingData {
  tasks: OnbItem[];
  error: OnboardingError;
}

export async function getOnboardingTasks(teamPageId: string | null): Promise<OnboardingData> {
  // modo diseño local (sin Notion configurado): preview de plantilla, no es un error
  if (!NOTION_TOKEN) return { tasks: templatePreview(), error: null };
  // logueado pero sin registro en Team → no inventamos tareas, lo decimos
  // (excepto en modo demo: muestra la plantilla para poder demostrar el flujo sin invite real)
  if (!teamPageId) {
    if (DEMO_MODE) return { tasks: templatePreview(), error: null };
    return { tasks: [], error: 'no-team' };
  }

  try {
    let raw = await queryOnboarding(teamPageId);

    // siembra inicial
    if (raw.length === 0) {
      await Promise.all(ONBOARDING.map((o) => createOnboardingTask(o, teamPageId)));
      raw = await queryOnboarding(teamPageId);
    }

    const orderOf = (name: string) => {
      const i = ONBOARDING.findIndex((o) => norm(o.name) === norm(name));
      return i === -1 ? ONBOARDING.length + 1 : i; // extras de Notion (sin plantilla) al final
    };

    const tasks = raw
      .map((t) => {
        const ux = enrich(t.name);
        return {
          id: t.id,
          notionId: t.id,
          name: t.name, // Notion
          blurb: t.description, // Notion
          done: t.done, // Notion
          source: 'notion' as const,
          kind: ux.embedUrl ? ('read' as const) : (ux.kind ?? 'action'),
          embedUrl: ux.embedUrl,
          readMins: ux.readMins,
          steps: ux.steps,
          ctaLabel: ux.ctaLabel,
          ctaUrl: ux.ctaUrl,
          _order: orderOf(t.name),
        };
      })
      .sort((a, b) => a._order - b._order)
      .map(({ _order, ...item }) => item);

    return { tasks, error: null };
  } catch (e) {
    // NO caemos en preview silencioso: surface real del error (antes esto escondía un sort roto)
    console.error('[onboarding] fallo leyendo Tasks de Notion:', e);
    return { tasks: [], error: 'notion' };
  }
}

/** marca/desmarca una Task de Notion (Status → Done / Not Started) */
export async function setTaskDone(taskId: string, done: boolean): Promise<boolean> {
  if (!NOTION_TOKEN) return false;
  try {
    await notion().pages.update({
      page_id: taskId,
      properties: { Status: { status: { name: done ? 'Done' : 'Not Started' } } },
    });
    return true;
  } catch {
    return false;
  }
}
