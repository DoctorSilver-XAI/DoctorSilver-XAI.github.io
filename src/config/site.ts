/**
 * CONFIGURATION MÉTIER : source unique, typée et documentée.
 * Deux fenêtres de soutenance hiérarchisées (privilégiée / repli).
 */

export type Role = 'jury' | 'invite';
export type Presence = 'oui' | 'peut_etre';
export type WindowTier = 'preferred' | 'fallback';

export interface DayDef {
  /** Identifiant stable utilisé dans les clés de créneau et en base. */
  id: string;
  /** Jour de la semaine (1 = lundi … 7 = dimanche). */
  dow: number;
  /** Quantième du mois. */
  dom: number;
  /** Mois (1-12) — dénormalisé depuis la fenêtre pour le formatage des dates. */
  month: number;
  /** Année — dénormalisée depuis la fenêtre. */
  year: number;
  /** Vrai si le jour est « à éviter » (grisé mais sélectionnable). */
  avoid?: boolean;
}

export interface SlotDef {
  id: string;
  sh: number;
  eh: number;
}

/** Clé canonique d'un créneau : `${dayId}__${slotId}` (ex. `lun20__s9`). */
export type SlotKey = string;

export interface WindowDef {
  /** Identifiant stable de la fenêtre. */
  id: string;
  /** Niveau de préférence : privilégiée ou repli. */
  tier: WindowTier;
  /** Mois (1-12) de la semaine. */
  month: number;
  /** Année de la semaine. */
  year: number;
  /** Titre de section. */
  titleFr: string;
  titleEn: string;
  /** Message honnête expliquant le statut de la fenêtre. */
  noteFr: string;
  noteEn: string;
  /** Jours proposés dans cette fenêtre. */
  days: DayDef[];
}

export const SITE = {
  /** Adresse universitaire de réception des disponibilités (fallback mailto). */
  email: 'pierre.gil2@etu.univ-lyon1.fr',

  /** Candidat (auteur de la thèse). */
  author: {
    name: 'Pierre Gil',
    linkedin: 'https://www.linkedin.com/in/pierre-gil/',
  },

  /**
   * Fenêtres de soutenance proposées, par ordre de préférence.
   * - sem-juillet (privilégiée) : la faculté ferme le 25 juillet.
   * - sem-aout (repli) : uniquement si aucune disponibilité commune en juillet.
   */
  windows: [
    {
      id: 'sem-juillet',
      tier: 'preferred',
      month: 7,
      year: 2026,
      titleFr: 'Semaine privilégiée — 20 au 24 juillet 2026',
      titleEn: 'Preferred week — 20 to 24 July 2026',
      noteFr: 'Semaine privilégiée pour la soutenance.',
      noteEn: 'Preferred week for the defense.',
      days: [
        { id: 'lun20', dow: 1, dom: 20, month: 7, year: 2026 },
        { id: 'mar21', dow: 2, dom: 21, month: 7, year: 2026 },
        { id: 'mer22', dow: 3, dom: 22, month: 7, year: 2026 },
        { id: 'jeu23', dow: 4, dom: 23, month: 7, year: 2026 },
        { id: 'ven24', dow: 5, dom: 24, month: 7, year: 2026, avoid: true },
      ],
    },
    {
      id: 'sem-aout',
      tier: 'fallback',
      month: 8,
      year: 2026,
      titleFr: 'Repli — 17 au 21 août 2026',
      titleEn: 'Fallback — 17 to 21 August 2026',
      noteFr:
        'Uniquement si aucune disponibilité commune en juillet — la faculté est fermée du 25 juillet au 17 août.',
      noteEn:
        'Only if no common availability in July — the faculty is closed from 25 July to 17 August.',
      days: [
        { id: 'lun17', dow: 1, dom: 17, month: 8, year: 2026 },
        { id: 'mar18', dow: 2, dom: 18, month: 8, year: 2026 },
        { id: 'mer19', dow: 3, dom: 19, month: 8, year: 2026 },
        { id: 'jeu20', dow: 4, dom: 20, month: 8, year: 2026 },
        { id: 'ven21', dow: 5, dom: 21, month: 8, year: 2026, avoid: true },
      ],
    },
  ] satisfies WindowDef[],

  /** Créneaux de 2 h. */
  slots: [
    { id: 's9', sh: 9, eh: 11 },
    { id: 's11', sh: 11, eh: 13 },
    { id: 's14', sh: 14, eh: 16 },
    { id: 's16', sh: 16, eh: 18 },
  ] satisfies SlotDef[],

  /**
   * Créneaux recommandés (halo + badge) : nudge d'organisation pour converger vite
   * vers la fenêtre privilégiée. PAS une preuve sociale (aucune confirmation réelle codée).
   */
  recommendedSlots: ['lun20__s9', 'mar21__s9'] as SlotKey[],

  /** Lieu de la soutenance. */
  venue: {
    name: 'ISPB, Faculté de Pharmacie de Lyon',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08',
    capacity: 60,
  },

  /**
   * Date verrouillée de la soutenance. `null` tant qu'elle n'est pas fixée.
   * Quand connue : { startISO: '2026-07-20T09:00:00', durationMin: 120, room: 'Amphi A' }.
   */
  defenseDate: {
    startISO: '2026-07-22T14:00:00',
    durationMin: 120,
    room: 'Salle des thèses',
  } as null | { startISO: string; durationMin: number; room?: string },

  /** Composition du jury (référence ; affichée le jour J seulement). */
  jury: [
    { name: 'Pr Hans-Martin Spath', roleFr: 'Président', roleEn: 'President' },
    { name: 'Pr Maryem Rhanoui', roleFr: 'Directrice de thèse', roleEn: 'Thesis director' },
    { name: 'Dr François Claron', roleFr: 'Membre', roleEn: 'Member' },
    { name: 'Dr Matthieu Lebrat', roleFr: 'Membre', roleEn: 'Member' },
    { name: 'Dr Rachel Megard', roleFr: 'Membre', roleEn: 'Member' },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers dérivés (purs)                                              */
/* ------------------------------------------------------------------ */

/** Construit une clé de créneau. */
export function slotKey(dayId: string, slotId: string): SlotKey {
  return `${dayId}__${slotId}`;
}

/** Décompose une clé en { dayId, slotId }. */
export function splitKey(key: SlotKey): { dayId: string; slotId: string } {
  const [dayId, slotId] = key.split('__');
  return { dayId, slotId };
}

/** Tous les jours, toutes fenêtres confondues, dans l'ordre d'affichage. */
export function allDays(): DayDef[] {
  return SITE.windows.flatMap((w) => w.days);
}

/** Toutes les clés de créneau valides (jour × slot), dans l'ordre d'affichage. */
export function allSlotKeys(): SlotKey[] {
  return allDays().flatMap((d) => SITE.slots.map((s) => slotKey(d.id, s.id)));
}

export function dayById(id: string): DayDef | undefined {
  return allDays().find((d) => d.id === id);
}

export function slotById(id: string): SlotDef | undefined {
  return SITE.slots.find((s) => s.id === id);
}

/** Fenêtre contenant un jour donné (pour résoudre le tier). */
export function windowOfDay(dayId: string): WindowDef | undefined {
  return SITE.windows.find((w) => w.days.some((d) => d.id === dayId));
}

export function isRecommendedSlot(key: SlotKey): boolean {
  return SITE.recommendedSlots.includes(key);
}
