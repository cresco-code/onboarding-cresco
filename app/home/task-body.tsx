'use client';

import type { CBlock } from '@/lib/notion-content';
import { translatedBody } from '@/lib/onboarding';
import { useLocale } from '@/lib/i18n/locale-context';
import { strings } from '@/lib/i18n/strings';
import { NotionBlocks } from './notion-blocks';
import styles from './home.module.css';

/** renderiza el cuerpo de una tarea (contenido de Notion, o su traducción en inglés). Compartido por el lector y las cartas. */
export function TaskBody({ blocks, name }: { blocks: CBlock[] | null; name: string }) {
  const { locale } = useLocale();
  const T = strings(locale);
  const effective = translatedBody(name, locale) ?? blocks;

  if (effective === null) {
    return (
      <div className={styles.rloading}>
        <span className={styles.rspin} />
      </div>
    );
  }

  const embed = effective.find((b) => b.type === 'embed');
  const rest = effective.filter((b) => b.type !== 'embed');

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
        {effective.length > 0 ? (
          <NotionBlocks blocks={effective} />
        ) : (
          <p className={styles.rempty}>{T.body.empty}</p>
        )}
      </div>
    </div>
  );
}
