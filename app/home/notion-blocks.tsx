'use client';

import { Fragment, type ReactNode, type CSSProperties } from 'react';
import type { CBlock, RT } from '@/lib/notion-content';
import styles from './home.module.css';

function Rich({ parts }: { parts?: RT[] }) {
  if (!parts || parts.length === 0) return null;
  return (
    <>
      {parts.map((t, i) => {
        let node: ReactNode = t.text;
        if (t.code) node = <code key={i}>{node}</code>;
        const style: CSSProperties = {};
        if (t.bold) style.fontWeight = 600;
        if (t.italic) style.fontStyle = 'italic';
        if (t.strike) style.textDecoration = 'line-through';
        if (t.underline) style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'underline';
        if (t.href) {
          return (
            <a key={i} href={t.href} target="_blank" rel="noreferrer" className={styles.nlink} style={style}>
              {node}
            </a>
          );
        }
        return (
          <span key={i} style={style}>
            {node}
          </span>
        );
      })}
    </>
  );
}

/** renderiza el cuerpo de la página de Notion, agrupando listas consecutivas */
export function NotionBlocks({ blocks }: { blocks: CBlock[] }) {
  const out: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];

    // agrupa listas consecutivas del mismo tipo
    if (b.type === 'ol' || b.type === 'ul') {
      const kind = b.type;
      const items: CBlock[] = [];
      while (i < blocks.length && blocks[i].type === kind) {
        items.push(blocks[i]);
        i++;
      }
      const List = kind === 'ol' ? 'ol' : 'ul';
      out.push(
        <List key={`l${i}`} className={kind === 'ol' ? styles.nol : styles.nul}>
          {items.map((it, k) => (
            <li key={k}>
              <Rich parts={it.rich} />
            </li>
          ))}
        </List>,
      );
      continue;
    }

    switch (b.type) {
      case 'h1':
        out.push(<h2 key={i} className={styles.nh1}><Rich parts={b.rich} /></h2>);
        break;
      case 'h2':
        out.push(<h3 key={i} className={styles.nh2}><Rich parts={b.rich} /></h3>);
        break;
      case 'h3':
        out.push(<h4 key={i} className={styles.nh3}><Rich parts={b.rich} /></h4>);
        break;
      case 'p':
        out.push(<p key={i} className={styles.np}><Rich parts={b.rich} /></p>);
        break;
      case 'todo':
        out.push(
          <div key={i} className={`${styles.ntodo}${b.checked ? ' ' + styles.on : ''}`}>
            <span className={styles.ntick}>{b.checked ? '✓' : ''}</span>
            <span><Rich parts={b.rich} /></span>
          </div>,
        );
        break;
      case 'quote':
        out.push(<blockquote key={i} className={styles.nquote}><Rich parts={b.rich} /></blockquote>);
        break;
      case 'callout':
        out.push(
          <div key={i} className={styles.ncallout}>
            <span className={styles.nicon}>{b.icon ?? '💡'}</span>
            <span><Rich parts={b.rich} /></span>
          </div>,
        );
        break;
      case 'code':
        out.push(<pre key={i} className={styles.ncode}><code>{(b.rich ?? []).map((t) => t.text).join('')}</code></pre>);
        break;
      case 'divider':
        out.push(<hr key={i} className={styles.ndivider} />);
        break;
      case 'bookmark':
        out.push(
          <a key={i} href={b.url} target="_blank" rel="noreferrer" className={styles.nbookmark}>
            <span className={styles.nbtext}>{b.caption || b.url}</span>
            <span className={styles.nbarr}>↗</span>
          </a>,
        );
        break;
      case 'embed':
        out.push(<iframe key={i} src={b.url} className={styles.nembed} title="embed" loading="lazy" />);
        break;
      case 'image':
        // eslint-disable-next-line @next/next/no-img-element
        out.push(<img key={i} src={b.url} alt={b.caption ?? ''} className={styles.nimg} />);
        break;
      default:
        break;
    }
    i++;
  }

  return <Fragment>{out}</Fragment>;
}
