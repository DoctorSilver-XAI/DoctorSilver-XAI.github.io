import { describe, it, expect } from 'vitest';
import {
  countsToMap,
  aggregateMatrix,
  maxCount,
  bestKeys,
  totalAvailability,
} from '@/lib/voteAggregation';

describe('countsToMap', () => {
  it('transforme la liste en table clé → nombre', () => {
    expect(countsToMap([{ creneau: 'mar7__s9', n_dispo: 3 }])).toEqual({ mar7__s9: 3 });
  });
});

describe('aggregateMatrix', () => {
  it('produit 5 jours × 4 créneaux, avec les compteurs et le drapeau recommandé', () => {
    const m = aggregateMatrix({ mar7__s9: 3 });
    expect(m).toHaveLength(5);
    m.forEach((row) => expect(row.cells).toHaveLength(4));
    const cell = m.find((r) => r.day.id === 'mar7')?.cells.find((c) => c.slot.id === 's9');
    expect(cell?.n).toBe(3);
    expect(cell?.recommended).toBe(true);
  });
});

describe('maxCount / bestKeys / totalAvailability', () => {
  const map = { mar7__s9: 3, lun6__s9: 1 };
  it('calcule le maximum', () => expect(maxCount(map)).toBe(3));
  it('identifie la ou les clés gagnantes', () => expect(bestKeys(map)).toEqual(['mar7__s9']));
  it('somme toutes les disponibilités', () => expect(totalAvailability(map)).toBe(4));
  it('ne retourne aucune clé quand tout est à zéro', () => expect(bestKeys({ a: 0 })).toEqual([]));
});
