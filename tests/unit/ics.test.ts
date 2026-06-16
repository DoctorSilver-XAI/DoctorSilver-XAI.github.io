import { describe, it, expect } from 'vitest';
import { toIcsDate, escapeIcsText, foldLine, generateICS } from '@/lib/ics';

describe('toIcsDate', () => {
  it('formate en UTC YYYYMMDDTHHMMSSZ', () => {
    expect(toIcsDate(new Date(Date.UTC(2026, 6, 7, 9, 0, 0)))).toBe('20260707T090000Z');
  });
});

describe('escapeIcsText', () => {
  it('échappe \\ ; , et les retours à la ligne', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });
});

describe('foldLine', () => {
  it('ne plie pas une ligne <= 75 octets', () => {
    const s = 'X'.repeat(70);
    expect(foldLine(s)).toBe(s);
  });

  it('plie une ligne > 75 octets en segments <= 75 octets (CRLF + espace)', () => {
    const folded = foldLine('A'.repeat(200));
    expect(folded).toContain('\r\n ');
    folded.split('\r\n ').forEach((seg, i) => {
      const bytes = new TextEncoder().encode(seg).length + (i > 0 ? 1 : 0);
      expect(bytes).toBeLessThanOrEqual(75);
    });
  });
});

describe('generateICS', () => {
  const ics = generateICS({
    uid: 'u1',
    start: new Date(Date.UTC(2026, 6, 7, 9, 0, 0)),
    end: new Date(Date.UTC(2026, 6, 7, 11, 0, 0)),
    title: 'Soutenance; test',
    stamp: new Date(Date.UTC(2026, 6, 1, 0, 0, 0)),
  });

  it('utilise exclusivement des CRLF', () => {
    expect(ics).toContain('\r\n');
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('contient la structure VCALENDAR / VEVENT', () => {
    for (const token of ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'END:VEVENT', 'END:VCALENDAR']) {
      expect(ics).toContain(token);
    }
  });

  it('contient DTSTART/DTEND/UID et un SUMMARY échappé', () => {
    expect(ics).toContain('DTSTART:20260707T090000Z');
    expect(ics).toContain('DTEND:20260707T110000Z');
    expect(ics).toContain('UID:u1');
    expect(ics).toContain('SUMMARY:Soutenance\\; test');
  });
});
