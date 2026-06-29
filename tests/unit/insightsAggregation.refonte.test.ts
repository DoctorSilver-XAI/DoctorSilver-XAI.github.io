import { describe, it, expect } from 'vitest';
import { histogram, majorityBin, familiarityAverages, totalForModule } from '@/lib/insightsAggregation';

const counts = [
  { module_id: 'delai-diagnostic', answer_key: '4', n: 3 },
  { module_id: 'delai-diagnostic', answer_key: '5', n: 2 },
  { module_id: 'delai-diagnostic', answer_key: '12', n: 1 },
  { module_id: 'familiarite', answer_key: 'ml:4', n: 1 },
  { module_id: 'familiarite', answer_key: 'ml:2', n: 1 },
  { module_id: 'familiarite', answer_key: 'reseaux:5', n: 1 },
];

describe('histogram', () => {
  it('regroupe par tranches', () => {
    const bins = histogram(counts, 'delai-diagnostic', { min: 0, max: 20, binSize: 4 });
    expect(bins.length).toBe(5);
    expect(bins[1]).toEqual({ start: 4, end: 8, n: 5 });
    expect(bins[3]).toEqual({ start: 12, end: 16, n: 1 });
  });
});
describe('majorityBin', () => {
  it('renvoie la tranche la plus fournie', () => {
    const bins = histogram(counts, 'delai-diagnostic', { min: 0, max: 20, binSize: 4 });
    expect(majorityBin(bins)).toEqual({ start: 4, end: 8, n: 5 });
  });
});
describe('familiarityAverages', () => {
  it('moyenne par item', () => {
    const a = familiarityAverages(counts, 'familiarite', ['ml', 'reseaux']);
    expect(a.ml).toBe(3);
    expect(a.reseaux).toBe(5);
  });
});
describe('totalForModule', () => {
  it('somme les compteurs', () => {
    expect(totalForModule(counts, 'delai-diagnostic')).toBe(6);
  });
});
