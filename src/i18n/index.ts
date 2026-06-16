import { fr, type Dict } from './fr';
import { en } from './en';

export type Lang = 'fr' | 'en';
export type { Dict };

export const LANGS: Lang[] = ['fr', 'en'];
export const DEFAULT_LANG: Lang = 'fr';

const dicts: Record<Lang, Dict> = { fr, en };

/** Retourne le dictionnaire complet et typé d'une langue. Usage : `const t = useTranslations(lang)`. */
export function useTranslations(lang: Lang): Dict {
  return dicts[lang];
}

/**
 * Interpole les marqueurs {clé} d'un gabarit.
 * Ex. : interpolate('{n} créneaux', { n: 3 }) -> '3 créneaux'.
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`,
  );
}
