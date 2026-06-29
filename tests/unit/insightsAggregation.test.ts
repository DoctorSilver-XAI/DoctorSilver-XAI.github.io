import { describe, it, expect } from 'vitest';
import { distribution, sliderAverage, slidersAverages, totalResponses } from '@/lib/insightsAggregation';

const counts = [
  { module_id: 'xai-verrou', answer_key: 'explicabilite', n: 3 },
  { module_id: 'xai-verrou', answer_key: 'cout', n: 1 },
  { module_id: 'opinion-aug-sub', answer_key: '8', n: 1 },
  { module_id: 'opinion-aug-sub', answer_key: '6', n: 1 },
  { module_id: 'familiarite-ia', answer_key: 'shap:7', n: 1 },
  { module_id: 'familiarite-ia', answer_key: 'shap:3', n: 1 },
  { module_id: 'familiarite-ia', answer_key: 'ml:9', n: 1 },
];

describe('distribution', () => {
  it('calcule n et pourcentage par option', () => {
    const d = distribution(counts, 'xai-verrou', ['performance', 'explicabilite', 'cout', 'reglementation']);
    expect(d.find((o) => o.key === 'explicabilite')).toEqual({ key: 'explicabilite', n: 3, pct: 75 });
    expect(d.find((o) => o.key === 'performance')).toEqual({ key: 'performance', n: 0, pct: 0 });
  });
});
describe('totalResponses', () => {
  it('somme les compteurs du module', () => {
    expect(totalResponses(counts, 'xai-verrou')).toBe(4);
  });
});
describe('sliderAverage', () => {
  it('moyenne des buckets numériques', () => {
    expect(sliderAverage(counts, 'opinion-aug-sub')).toBe(7);
  });
  it('null si aucune donnée', () => {
    expect(sliderAverage(counts, 'inexistant')).toBeNull();
  });
});
describe('slidersAverages', () => {
  it('moyenne par item préfixé', () => {
    const a = slidersAverages(counts, 'familiarite-ia', ['ml', 'shap']);
    expect(a.shap).toBe(5);
    expect(a.ml).toBe(9);
  });
});
