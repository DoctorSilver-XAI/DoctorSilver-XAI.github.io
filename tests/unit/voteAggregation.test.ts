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
    expect(countsToMap([{ creneau: 'lun20__s9', n_dispo: 3 }])).toEqual({ lun20__s9: 3 });
  });
});

describe('aggregateMatrix', () => {
  it('produit 10 jours × 4 créneaux, avec les compteurs et les drapeaux recommandés', () => {
    const m = aggregateMatrix({ lun20__s9: 3, mar21__s9: 2 });
    expect(m).toHaveLength(10);
    m.forEach((row) => expect(row.cells).toHaveLength(4));
    const monday = m.find((r) => r.day.id === 'lun20')?.cells.find((c) => c.slot.id === 's9');
    const tuesday = m.find((r) => r.day.id === 'mar21')?.cells.find((c) => c.slot.id === 's9');
    expect(monday?.n).toBe(3);
    expect(monday?.recommended).toBe(true);
    expect(tuesday?.n).toBe(2);
    expect(tuesday?.recommended).toBe(true);
  });
});

describe('maxCount / bestKeys / totalAvailability', () => {
  const map = { mar21__s9: 3, lun20__s9: 1 };
  it('calcule le maximum', () => expect(maxCount(map)).toBe(3));
  it('identifie la ou les clés gagnantes', () => expect(bestKeys(map)).toEqual(['mar21__s9']));
  it('somme toutes les disponibilités', () => expect(totalAvailability(map)).toBe(4));
  it('ne retourne aucune clé quand tout est à zéro', () => expect(bestKeys({ a: 0 })).toEqual([]));
});
