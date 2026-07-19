export type Locale = 'es' | 'en';

export const LOCALES: Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';

/** localStorage key — sigue el mismo prefijo que las otras preferencias (cresco_onb_*) */
export const LOCALE_STORAGE_KEY = 'cresco_onb_locale';
