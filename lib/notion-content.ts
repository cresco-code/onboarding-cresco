import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY;
const notion = () => new Client({ auth: NOTION_TOKEN });

/** rich text serializable para el cliente */
export interface RT {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  underline?: boolean;
  href?: string | null;
}

/** bloque simplificado, serializable, que el lector renderiza */
export interface CBlock {
  type: 'p' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'todo' | 'quote' | 'callout' | 'divider' | 'code' | 'bookmark' | 'embed' | 'image';
  rich?: RT[];
  url?: string;
  caption?: string;
  checked?: boolean;
  icon?: string;
  lang?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rt(arr: any[]): RT[] {
  return (arr ?? []).map((t) => ({
    text: t.plain_text ?? '',
    bold: t.annotations?.bold || undefined,
    italic: t.annotations?.italic || undefined,
    code: t.annotations?.code || undefined,
    strike: t.annotations?.strikethrough || undefined,
    underline: t.annotations?.underline || undefined,
    href: t.href ?? null,
  }));
}
const plain = (arr: any[]) => (arr ?? []).map((t) => t.plain_text ?? '').join('');

function map(b: any): CBlock | null {
  switch (b.type) {
    case 'paragraph':
      return { type: 'p', rich: rt(b.paragraph.rich_text) };
    case 'heading_1':
      return { type: 'h1', rich: rt(b.heading_1.rich_text) };
    case 'heading_2':
      return { type: 'h2', rich: rt(b.heading_2.rich_text) };
    case 'heading_3':
      return { type: 'h3', rich: rt(b.heading_3.rich_text) };
    case 'numbered_list_item':
      return { type: 'ol', rich: rt(b.numbered_list_item.rich_text) };
    case 'bulleted_list_item':
      return { type: 'ul', rich: rt(b.bulleted_list_item.rich_text) };
    case 'to_do':
      return { type: 'todo', rich: rt(b.to_do.rich_text), checked: b.to_do.checked };
    case 'quote':
      return { type: 'quote', rich: rt(b.quote.rich_text) };
    case 'callout':
      return { type: 'callout', rich: rt(b.callout.rich_text), icon: b.callout.icon?.emoji };
    case 'divider':
      return { type: 'divider' };
    case 'code':
      return { type: 'code', rich: rt(b.code.rich_text), lang: b.code.language };
    case 'bookmark':
      return { type: 'bookmark', url: b.bookmark.url, caption: plain(b.bookmark.caption) };
    case 'embed':
      return { type: 'embed', url: b.embed.url };
    case 'image': {
      const url = b.image?.type === 'external' ? b.image.external.url : b.image?.file?.url;
      return { type: 'image', url, caption: plain(b.image?.caption) };
    }
    default:
      return null;
  }
}

/** lee el cuerpo de una página de Notion como bloques renderizables */
export async function getTaskContent(notionId: string): Promise<CBlock[]> {
  if (!NOTION_TOKEN) return [];
  try {
    const res = await notion().blocks.children.list({ block_id: notionId, page_size: 100 });
    return res.results.map(map).filter((b): b is CBlock => b !== null);
  } catch {
    return [];
  }
}
