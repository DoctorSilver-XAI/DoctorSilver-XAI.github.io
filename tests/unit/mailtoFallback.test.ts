import { describe, it, expect } from 'vitest';
import { orderSlotKeys, describeSlot, buildSummaryText, buildMailto } from '@/lib/mailtoFallback';

describe('orderSlotKeys', () => {
  it('ordonne selon CONFIG (jour puis créneau)', () => {
    expect(orderSlotKeys(['mer8__s14', 'lun6__s9', 'mar7__s9'])).toEqual([
      'lun6__s9',
      'mar7__s9',
      'mer8__s14',
    ]);
  });
});

describe('describeSlot', () => {
  it('décrit le créneau recommandé avec ⭐ (FR)', () => {
    const s = describeSlot('mar7__s9', 'fr');
    expect(s).toContain('Mardi 7 juillet 2026');
    expect(s).toContain('9 h–11 h');
    expect(s).toContain('⭐');
  });
});

describe('buildSummaryText', () => {
  const txt = buildSummaryText({
    name: 'Jean Dupont',
    role: 'jury',
    slots: ['mar7__s9', 'lun6__s14'],
    lang: 'fr',
  });

  it('contient le nom et le rôle lisible', () => {
    expect(txt).toContain('Jean Dupont');
    expect(txt).toContain('Membre du jury');
  });

  it('liste les créneaux dans l’ordre canonique', () => {
    const iLun = txt.indexOf('Lundi 6');
    const iMar = txt.indexOf('Mardi 7');
    expect(iLun).toBeGreaterThanOrEqual(0);
    expect(iMar).toBeGreaterThanOrEqual(0);
    expect(iLun).toBeLessThan(iMar);
  });
});

describe('buildMailto', () => {
  it('produit une URL mailto encodée vers l’adresse universitaire', () => {
    const url = buildMailto({ name: 'Jean', role: 'invite', slots: ['mar7__s9'], lang: 'fr' });
    expect(url.startsWith('mailto:pierre.gil2@etu.univ-lyon1.fr')).toBe(true);
    expect(url).toContain('subject=');
    const body = decodeURIComponent(url.split('body=')[1] ?? '');
    expect(body).toContain('Mardi 7 juillet 2026');
  });
});
