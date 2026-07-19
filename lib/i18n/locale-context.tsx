'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from './locale';

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const Ctx = createContext<LocaleCtx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  toggleLocale: () => {},
});

/** sin preferencia guardada: default por el idioma del navegador (no geo-IP) — español si el navegador es español, inglés para cualquier otro (cubre USA/Europa y cualquier visitante no hispanohablante) */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  const primary = (langs[0] ?? '').toLowerCase();
  return primary.startsWith('es') ? 'es' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // arranca en 'es' (igual que el server) y se corrige al montar, como el resto de las preferencias locales
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    if (saved === 'es' || saved === 'en') {
      setLocaleState(saved);
    } else {
      // primera visita, sin preferencia guardada todavía: detecta y NO persiste —
      // así sigue detectando en cada visita hasta que la persona toque el toggle a propósito
      setLocaleState(detectLocale());
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem(LOCALE_STORAGE_KEY, l);
  };
  const toggleLocale = () => setLocale(locale === 'es' ? 'en' : 'es');

  return <Ctx.Provider value={{ locale, setLocale, toggleLocale }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
