import { describe, it, expect } from 'vitest';
import { orderSlotKeys, describeSlot, buildSummaryText, buildMailto } from '@/lib/mailtoFallback';

describe('orderSlotKeys', () => {
  it('ordonne selon CONFIG (jour puis créneau)', () => {
    expect(orderSlotKeys(['mer22__s14', 'lun20__s9', 'mar21__s9'])).toEqual([
      'lun20__s9',
      'mar21__s9',
      'mer22__s14',
    ]);
  });
  it("classe les créneaux d'août après ceux de juillet", () => {
    expect(orderSlotKeys(['lun17__s9', 'jeu23__s9'])).toEqual(['jeu23__s9', 'lun17__s9']);
  });
});

describe('describeSlot', () => {
  it('décrit un créneau recommandé avec ⭐ (FR)', () => {
    const s = describeSlot('lun20__s9', 'fr');
    expect(s).toContain('Lundi 20 juillet 2026');
    expect(s).toContain('9 h–11 h');
    expect(s).toContain('⭐');
  });
  it('décrit le second créneau recommandé avec ⭐ (FR)', () => {
    const s = describeSlot('mar21__s9', 'fr');
    expect(s).toContain('Mardi 21 juillet 2026');
    expect(s).toContain('⭐');
  });
});

describe('buildSummaryText', () => {
  const txt = buildSummaryText({
    name: 'Jean Dupont',
    role: 'jury',
    slots: ['mar21__s9', 'lun20__s14'],
    lang: 'fr',
  });
  it('contient le nom et le rôle lisible', () => {
    expect(txt).toContain('Jean Dupont');
    expect(txt).toContain('Membre du jury');
  });
  it("liste les créneaux dans l'ordre canonique", () => {
    const iLun = txt.indexOf('Lundi 20');
    const iMar = txt.indexOf('Mardi 21');
    expect(iLun).toBeGreaterThanOrEqual(0);
    expect(iMar).toBeGreaterThanOrEqual(0);
    expect(iLun).toBeLessThan(iMar);
  });
});

describe('buildMailto', () => {
  it("produit une URL mailto encodée vers l'adresse universitaire", () => {
    const url = buildMailto({ name: 'Jean', role: 'invite', slots: ['lun20__s9'], lang: 'fr' });
    expect(url.startsWith('mailto:pierre.gil2@etu.univ-lyon1.fr')).toBe(true);
    expect(url).toContain('subject=');
    const body = decodeURIComponent(url.split('body=')[1] ?? '');
    expect(body).toContain('Lundi 20 juillet 2026');
  });
});
