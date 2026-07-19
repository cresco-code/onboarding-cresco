import { Client } from '@notionhq/client';

/**
 * Valida que un correo pertenezca al equipo de crescō, contra la base Team de Notion.
 * - Si hay NOTION_TOKEN + NOTION_TEAM_DATA_SOURCE_ID: consulta la base Team por Email.
 * - Si no hay config de Notion: cae a un allowlist por dominio (@cresco.so) para no bloquear el desarrollo.
 *
 * La base Team vive en collection://31d8af9a-4f71-80f4-8235-000bbe32d56e
 * (propiedad de email = "Email").
 */
const NOTION_TOKEN = process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY;
const TEAM_DATA_SOURCE_ID = process.env.NOTION_TEAM_DATA_SOURCE_ID;
const ALLOWED_DOMAIN = process.env.TEAM_ALLOWED_DOMAIN ?? 'cresco.so';
/** modo demo: cualquier cuenta de Google entra al onboarding general (nunca a /amedi ni /mogos, ver isCrescoDomain) */
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface TeamMember {
  name: string;
  email: string;
  role: string | null;
  area: string | null;
  /** id de la página Team en Notion (para filtrar Tasks por la relación Team) */
  pageId: string | null;
}

export async function getTeamMember(email: string): Promise<TeamMember | null> {
  const e = (email ?? '').trim().toLowerCase();
  if (!e) return null;

  // sin Notion configurado → allowlist por dominio
  if (!NOTION_TOKEN || !TEAM_DATA_SOURCE_ID) {
    return e.endsWith(`@${ALLOWED_DOMAIN}`)
      ? { name: e.split('@')[0], email: e, role: null, area: null, pageId: null }
      : null;
  }

  try {
    const notion = new Client({ auth: NOTION_TOKEN });
    // el login es @cresco.so (campo "Cresco email"); "Email" puede ser un correo personal
    const res = await notion.dataSources.query({
      data_source_id: TEAM_DATA_SOURCE_ID,
      filter: {
        or: [
          { property: 'Cresco email', email: { equals: e } },
          { property: 'Email', email: { equals: e } },
        ],
      },
      page_size: 1,
    });
    const page = res.results[0];
    if (!page || !('properties' in page)) return null;

    const props = page.properties as Record<string, unknown>;
    const title = props['Name'] as { title?: { plain_text: string }[] } | undefined;
    const role = props['Role'] as { rich_text?: { plain_text: string }[] } | undefined;
    const area = props['Area'] as { select?: { name: string } | null } | undefined;

    return {
      name: title?.title?.map((t) => t.plain_text).join('') || e.split('@')[0],
      email: e,
      role: role?.rich_text?.map((t) => t.plain_text).join('') || null,
      area: area?.select?.name ?? null,
      pageId: page.id,
    };
  } catch {
    return null;
  }
}

export async function isOnTeam(email: string): Promise<boolean> {
  return (await getTeamMember(email)) !== null;
}

/** true si el correo es del dominio de crescō (@cresco.so), sin excepción — el gate real de amedi/mogos */
export function isCrescoDomain(email: string): boolean {
  return (email ?? '').trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Gate de acceso al onboarding general: cuentas del workspace de crescō,
 * o cualquier cuenta de Google si NEXT_PUBLIC_DEMO_MODE=true (para demos —
 * no afecta a isCrescoDomain, que sigue exigiendo @cresco.so en amedi/mogos).
 * El match contra Team (getTeamMember) se usa para enriquecer el perfil, no para bloquear.
 */
export function isAllowed(email: string): boolean {
  if (DEMO_MODE) return true;
  return isCrescoDomain(email);
}
