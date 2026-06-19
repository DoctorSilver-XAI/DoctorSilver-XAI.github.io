import { describe, it, expect } from 'vitest';
import { SITE, allDays, allSlotKeys, dayById, windowOfDay, isRecommendedSlot } from '@/config/site';

describe('SITE.windows', () => {
  it('expose deux fenêtres hiérarchisées (juillet preferred, août fallback)', () => {
    expect(SITE.windows.map((w) => w.id)).toEqual(['sem-juillet', 'sem-aout']);
    expect(SITE.windows[0].tier).toBe('preferred');
    expect(SITE.windows[0].month).toBe(7);
    expect(SITE.windows[1].tier).toBe('fallback');
    expect(SITE.windows[1].month).toBe(8);
  });
});

describe('allDays / allSlotKeys', () => {
  it('aplatit 10 jours et 40 clés (10 jours × 4 créneaux)', () => {
    expect(allDays()).toHaveLength(10);
    expect(allSlotKeys()).toHaveLength(40);
    expect(allSlotKeys()).toContain('lun20__s9');
    expect(allSlotKeys()).toContain('jeu20__s16');
  });
});

describe('dayById / windowOfDay', () => {
  it('retrouve un jour et sa fenêtre par identifiant', () => {
    expect(dayById('lun20')?.dom).toBe(20);
    expect(dayById('lun17')?.month).toBe(8);
    expect(windowOfDay('mar21')?.tier).toBe('preferred');
    expect(windowOfDay('mer19')?.tier).toBe('fallback');
    expect(dayById('mar7')).toBeUndefined(); // ancienne clé supprimée
  });
});

describe('isRecommendedSlot', () => {
  it('recommande lundi et mardi matin de juillet', () => {
    expect(isRecommendedSlot('lun20__s9')).toBe(true);
    expect(isRecommendedSlot('mar21__s9')).toBe(true);
    expect(isRecommendedSlot('jeu23__s9')).toBe(false);
  });
});
