/**
 * CONFIGURATION MÉTIER : source unique, typée et documentée.
 * Tout ce qui peut être ajusté sans toucher au reste du code vit ici :
 * e-mail de réception, jours/créneaux proposés, créneau recommandé,
 * confirmations réelles (preuve sociale), lieu, capacité, date verrouillée.
 */

export type Role = 'jury' | 'invite';
export type Presence = 'oui' | 'peut_etre';

export interface DayDef {
  /** Identifiant stable utilisé dans les clés de créneau et en base. */
  id: string;
  /** Jour de la semaine (1 = lundi … 7 = dimanche), pour le formatage localisé. */
  dow: number;
  /** Quantième du mois. */
  dom: number;
  /** Vrai si le jour est « à éviter » (grisé mais sélectionnable). */
  avoid?: boolean;
}

export interface SlotDef {
  /** Identifiant stable du créneau. */
  id: string;
  /** Heure de début (format 24 h). */
  sh: number;
  /** Heure de fin (format 24 h). */
  eh: number;
}

/** Clé canonique d'un créneau : `${dayId}__${slotId}` (ex. `mar7__s9`). */
export type SlotKey = string;

export interface ConfirmedInfo {
  /** Libellé descriptif (confirmation réelle et consentie). */
  labelFr: string;
  labelEn: string;
  /** Initiales affichées en avatars. */
  avatars: string[];
}

export const SITE = {
  /** Adresse universitaire de réception des disponibilités (fallback mailto). */
  email: 'pierre.gil2@etu.univ-lyon1.fr',

  /** Candidat (auteur de la thèse). Mis en avant : hero + footer, avec lien LinkedIn. */
  author: {
    name: 'Pierre Gil',
    linkedin: 'https://www.linkedin.com/in/pierre-gil/',
  },

  /** Semaine de soutenance proposée. */
  defenseMonth: 7,
  defenseYear: 2026,

  /** Jours proposés (lun–jeu + vendredi « à éviter »). */
  days: [
    { id: 'lun6', dow: 1, dom: 6 },
    { id: 'mar7', dow: 2, dom: 7 },
    { id: 'mer8', dow: 3, dom: 8 },
    { id: 'jeu9', dow: 4, dom: 9 },
    { id: 'ven10', dow: 5, dom: 10, avoid: true },
  ] satisfies DayDef[],

  /** Créneaux de 2 h. */
  slots: [
    { id: 's9', sh: 9, eh: 11 },
    { id: 's11', sh: 11, eh: 13 },
    { id: 's14', sh: 14, eh: 16 },
    { id: 's16', sh: 16, eh: 18 },
  ] satisfies SlotDef[],

  /**
   * Créneau recommandé (mis en avant, halo + badge).
   * INVARIANT honnêteté : doit correspondre à une confirmation jury RÉELLE, présente
   * à la fois dans `confirmed` (ci-dessous) ET dans supabase/seed.sql. Ne pas appliquer
   * la migration sans le seed (cf. docs/SUPABASE.md), sinon le badge « déjà confirmé »
   * coexisterait avec un compteur à 0.
   */
  recommendedSlot: 'mar7__s9' as SlotKey,

  /**
   * Confirmations RÉELLES et consenties : uniquement de la preuve sociale véridique.
   * Le NOMBRE affiché provient de Supabase (lignes seedées) ; ce libellé est descriptif.
   */
  confirmed: {
    mar7__s9: {
      labelFr: 'Déjà confirmé : Dr Claron + 2 invités',
      labelEn: 'Already confirmed: Dr Claron + 2 guests',
      avatars: ['DC', '+2'],
    },
  } as Record<SlotKey, ConfirmedInfo>,

  /** Lieu de la soutenance. */
  venue: {
    name: 'ISPB, Faculté de Pharmacie de Lyon',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08',
    /** Capacité indicative de la salle (jauge RSVP). La valeur de référence vit aussi en base. */
    capacity: 60,
  },

  /**
   * Date verrouillée de la soutenance.
   * `null` tant qu'elle n'est pas fixée → la section « Jour J » affiche l'état d'attente.
   * Quand connue : { startISO: '2026-07-07T09:00:00', durationMin: 120, room: 'Amphi A' }.
   */
  defenseDate: null as null | { startISO: string; durationMin: number; room?: string },

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

/** Toutes les clés de créneau valides (jour × slot), dans l'ordre d'affichage. */
export function allSlotKeys(): SlotKey[] {
  return SITE.days.flatMap((d) => SITE.slots.map((s) => slotKey(d.id, s.id)));
}

export function dayById(id: string): DayDef | undefined {
  return SITE.days.find((d) => d.id === id);
}

export function slotById(id: string): SlotDef | undefined {
  return SITE.slots.find((s) => s.id === id);
}
