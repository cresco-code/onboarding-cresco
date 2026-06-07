'use client';

import type { CBlock } from '@/lib/notion-content';
import { NotionBlocks } from './notion-blocks';
import styles from './home.module.css';

/** renderiza el cuerpo de una tarea (contenido de Notion). Compartido por el lector y las cartas. */
export function TaskBody({ blocks, name }: { blocks: CBlock[] | null; name: string }) {
  if (blocks === null) {
    return (
      <div className={styles.rloading}>
        <span className={styles.rspin} />
      </div>
    );
  }

  const embed = blocks.find((b) => b.type === 'embed');
  const rest = blocks.filter((b) => b.type !== 'embed');

  if (embed) {
    return (
      <>
        {rest.length > 0 && (
          <div className={styles.rintro}>
            <NotionBlocks blocks={rest} />
          </div>
        )}
        <iframe className={styles.rframe} src={embed.url} title={name} loading="lazy" />
      </>
    );
  }

  return (
    <div className={styles.raction}>
      <div className={styles.inner}>
        {blocks.length > 0 ? (
          <NotionBlocks blocks={blocks} />
        ) : (
          <p className={styles.rempty}>esta tarea aún no tiene contenido en Notion. agrégalo en la página de la tarea y aparecerá aquí.</p>
        )}
      </div>
    </div>
  );
}
