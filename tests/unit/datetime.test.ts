import { describe, it, expect } from 'vitest';
import { formatSlot, formatDayFull } from '@/lib/datetime';
import { SITE } from '@/config/site';

const mar7 = SITE.days.find((d) => d.id === 'mar7')!;
const s9 = SITE.slots.find((s) => s.id === 's9')!;

describe('formatSlot', () => {
  it('formate les créneaux selon la langue', () => {
    expect(formatSlot(s9, 'fr')).toBe('9 h–11 h');
    expect(formatSlot(s9, 'en')).toBe('9:00–11:00');
  });
});

describe('formatDayFull', () => {
  it('formate la date complète selon la langue', () => {
    expect(formatDayFull(mar7, 'fr')).toBe('Mardi 7 juillet 2026');
    expect(formatDayFull(mar7, 'en')).toBe('Tuesday, 7 July 2026');
  });
});
