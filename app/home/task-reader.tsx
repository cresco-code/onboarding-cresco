'use client';

import { useEffect, useState } from 'react';
import type { OnbItem } from '@/lib/onboarding';
import type { CBlock } from '@/lib/notion-content';
import { getTaskContentAction } from '@/app/actions';
import { TaskBody } from './task-body';
import styles from './home.module.css';

export function TaskReader({
  item,
  done,
  onClose,
  onToggle,
}: {
  item: OnbItem;
  done: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const [blocks, setBlocks] = useState<CBlock[] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // carga el cuerpo de la página de Notion al abrir
  useEffect(() => {
    let alive = true;
    setBlocks(null);
    if (item.notionId) {
      getTaskContentAction(item.notionId).then((b) => alive && setBlocks(b));
    } else {
      setBlocks([]);
    }
    return () => {
      alive = false;
    };
  }, [item.notionId]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.reader} onClick={(e) => e.stopPropagation()}>
        <div className={styles.rbar}>
          <button className={styles.rback} onClick={onClose} aria-label="Volver">←</button>
          <div className={styles.rtitle}>{item.name}</div>
          <button className={`${styles.rdone}${done ? ' ' + styles.on : ''}`} onClick={onToggle}>
            {done ? '✓ Hecho' : 'Marcar como hecho'}
          </button>
        </div>

        <TaskBody blocks={blocks} name={item.name} />
      </div>
    </div>
  );
}
