'use client';

import { useLocale } from '@/lib/i18n/locale-context';
import styles from './language-toggle.module.css';

/** selector ES/EN — persiste en localStorage vía LocaleProvider */
export function LanguageToggle({ variant = 'light', className }: { variant?: 'light' | 'dark'; className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className={`${styles.toggle}${variant === 'dark' ? ' ' + styles.dark : ''}${className ? ' ' + className : ''}`}>
      <span className={`${styles.indicator}${locale === 'en' ? ' ' + styles.indicatorOn : ''}`} aria-hidden="true" />
      <button
        className={`${styles.btn}${locale === 'es' ? ' ' + styles.on : ''}`}
        onClick={() => setLocale('es')}
        aria-pressed={locale === 'es'}
      >
        ES
      </button>
      <button
        className={`${styles.btn}${locale === 'en' ? ' ' + styles.on : ''}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
