import type { Lang } from './index';

/**
 * Routage i18n minimal, sans dépendance : le français est à la racine (`/`, `/jury`)
 * et l'anglais est préfixé par `/en` (`/en/`, `/en/jury`).
 *
 * @param path  Chemin « canonique » FR commençant par `/` (ex. `/`, `/jury`), SANS préfixe de langue.
 * @param lang  Langue cible.
 * @returns     Le chemin localisé, normalisé.
 */
export function localizedPath(path: string, lang: Lang): string {
  // Normalise : retire un éventuel slash final (sauf racine) et un préfixe /en déjà présent.
  let clean = path.replace(/^\/en(?=\/|$)/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  if (clean === '') clean = '/';

  if (lang === 'en') {
    return clean === '/' ? '/en/' : `/en${clean}`;
  }
  return clean;
}

/** Déduit la langue d'un pathname (utile pour le sélecteur de langue). */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'fr';
}

/** Retire le préfixe de langue d'un pathname pour obtenir le chemin canonique FR. */
export function basePath(pathname: string): string {
  let clean = pathname.replace(/^\/en(?=\/|$)/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return clean === '' ? '/' : clean;
}
