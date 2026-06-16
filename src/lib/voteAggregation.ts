import { SITE, slotKey, allSlotKeys, type DayDef, type SlotDef, type SlotKey } from '@/config/site';

/** Une ligne de la table/vue de compteurs Supabase. */
export interface SlotCount {
  creneau: SlotKey;
  n_dispo: number;
}

/** Transforme la liste de compteurs en table de correspondance clé → nombre. */
export function countsToMap(counts: SlotCount[]): Record<SlotKey, number> {
  const map: Record<SlotKey, number> = {};
  for (const c of counts) map[c.creneau] = c.n_dispo;
  return map;
}

export interface MatrixCell {
  slot: SlotDef;
  key: SlotKey;
  n: number;
  recommended: boolean;
}
export interface MatrixRow {
  day: DayDef;
  cells: MatrixCell[];
}

/** Construit la matrice jours × créneaux avec les compteurs (0 par défaut). */
export function aggregateMatrix(map: Record<SlotKey, number>): MatrixRow[] {
  return SITE.days.map((day) => ({
    day,
    cells: SITE.slots.map((slot) => {
      const key = slotKey(day.id, slot.id);
      return { slot, key, n: map[key] ?? 0, recommended: key === SITE.recommendedSlot };
    }),
  }));
}

/** Valeur maximale de disponibilités sur l'ensemble des créneaux. */
export function maxCount(map: Record<SlotKey, number>): number {
  return Object.values(map).reduce((m, n) => Math.max(m, n), 0);
}

/** Clés ayant le maximum de disponibilités (vide si tout est à 0). */
export function bestKeys(map: Record<SlotKey, number>): SlotKey[] {
  const max = maxCount(map);
  if (max <= 0) return [];
  // Ordre canonique (jour×créneau) pour un affichage stable, indépendant de
  // l'ordre d'arrivée des événements temps réel.
  return allSlotKeys().filter((k) => map[k] === max);
}

/** Somme totale des disponibilités cochées (toutes clés confondues). */
export function totalAvailability(map: Record<SlotKey, number>): number {
  return Object.values(map).reduce((s, n) => s + n, 0);
}
