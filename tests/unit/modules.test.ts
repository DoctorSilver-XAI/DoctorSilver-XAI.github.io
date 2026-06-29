import { describe, it, expect } from 'vitest';
import {
  MODULES,
  allModuleIds,
  moduleById,
  modulesByAxis,
  type Axis,
} from '@/config/modules';

describe('config modules', () => {
  it('expose des IDs uniques', () => {
    const ids = allModuleIds();
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('expose huit modules', () => {
    expect(MODULES).toHaveLength(8);
  });

  it('les modules à choix unique ont des options non vides', () => {
    for (const m of MODULES) {
      if (m.type === 'single') {
        expect(m.options && m.options.length).toBeGreaterThan(0);
      }
    }
  });

  it('chaque type porte sa configuration', () => {
    for (const m of MODULES) {
      if (m.type === 'estimation') expect(m.estimation).toBeDefined();
      if (m.type === 'concept-map') expect(m.conceptMap).toBeDefined();
      if (m.type === 'familiarity') expect(m.familiarity).toBeDefined();
    }
  });

  it('le concept-map ne mappe que des items et catégories déclarés', () => {
    for (const m of MODULES) {
      if (m.type !== 'concept-map' || !m.conceptMap) continue;
      const itemKeys = new Set(m.conceptMap.items.map((it) => it.key));
      const catKeys = new Set(m.conceptMap.categories.map((c) => c.key));
      for (const [item, cat] of Object.entries(m.conceptMap.mapping)) {
        expect(itemKeys.has(item)).toBe(true);
        expect(catKeys.has(cat)).toBe(true);
      }
    }
  });

  it('moduleById retrouve un module par identifiant', () => {
    expect(moduleById('delai-diagnostic')?.type).toBe('estimation');
    expect(moduleById('inexistant')).toBeUndefined();
  });

  it('modulesByAxis regroupe par axe', () => {
    const axes: Axis[] = ['langage', 'diagnostic', 'suivi', 'explicabilite'];
    const total = axes.reduce((s, a) => s + modulesByAxis(a).length, 0);
    expect(total).toBe(MODULES.length);
  });
});
