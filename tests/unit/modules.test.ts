import { describe, it, expect } from 'vitest';
import { MODULES, homeModules, juryModules, allModuleIds } from '@/config/modules';

describe('config modules', () => {
  it('expose des IDs uniques', () => {
    const ids = allModuleIds();
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('a exactement 4 modules sur la home', () => {
    expect(homeModules()).toHaveLength(4);
  });
  it('les modules à choix ont des options non vides', () => {
    for (const m of MODULES) {
      if (['single', 'multi', 'truefalse', 'estimate'].includes(m.type)) {
        expect(m.options && m.options.length).toBeGreaterThan(0);
      }
      if (m.type === 'sliders') expect(m.items && m.items.length).toBeGreaterThan(0);
    }
  });
  it('correctKey référence une option existante', () => {
    for (const m of MODULES) {
      if (m.correctKey) {
        expect(m.options?.some((o) => o.key === m.correctKey)).toBe(true);
      }
    }
  });
  it('juryModules contient tous les modules', () => {
    expect(juryModules().length).toBe(MODULES.length);
  });
});
