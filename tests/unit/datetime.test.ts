import { describe, it, expect } from 'vitest';
import { formatSlot, formatDayFull, formatDefenseLong, formatDefenseTime } from '@/lib/datetime';
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

describe('formatDefenseLong', () => {
  it('formate la date FR', () => {
    expect(formatDefenseLong('2026-07-22T14:00:00', 'fr')).toBe('Mercredi 22 juillet 2026');
  });
  it('formate la date EN', () => {
    expect(formatDefenseLong('2026-07-22T14:00:00', 'en')).toBe('Wednesday, 22 July 2026');
  });
});

describe('formatDefenseTime', () => {
  it('formate le créneau FR', () => {
    expect(formatDefenseTime('2026-07-22T14:00:00', 120, 'fr')).toBe('14 h–16 h');
  });
  it('formate le créneau EN', () => {
    expect(formatDefenseTime('2026-07-22T14:00:00', 120, 'en')).toBe('14:00–16:00');
  });
});
