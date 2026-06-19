import { describe, it, expect } from 'vitest';
import { formatSlot, formatDayFull } from '@/lib/datetime';
import { allDays, SITE } from '@/config/site';

const lun20 = allDays().find((d) => d.id === 'lun20')!;
const lun17 = allDays().find((d) => d.id === 'lun17')!;
const s9 = SITE.slots.find((s) => s.id === 's9')!;

describe('formatSlot', () => {
  it('formate les créneaux selon la langue', () => {
    expect(formatSlot(s9, 'fr')).toBe('9 h–11 h');
    expect(formatSlot(s9, 'en')).toBe('9:00–11:00');
  });
});

describe('formatDayFull', () => {
  it('formate une date de juillet selon la langue', () => {
    expect(formatDayFull(lun20, 'fr')).toBe('Lundi 20 juillet 2026');
    expect(formatDayFull(lun20, 'en')).toBe('Monday, 20 July 2026');
  });
  it("formate une date d’août (fenêtre de repli)", () => {
    expect(formatDayFull(lun17, 'fr')).toBe('Lundi 17 août 2026');
    expect(formatDayFull(lun17, 'en')).toBe('Monday, 17 August 2026');
  });
});
