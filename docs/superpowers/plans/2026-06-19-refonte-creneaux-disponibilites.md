# Refonte des créneaux de disponibilité — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconfigurer le recueil de disponibilités du site de soutenance pour proposer deux fenêtres hiérarchisées (semaine privilégiée 20-24 juillet 2026, repli 17-21 août 2026) au lieu d'une semaine unique.

**Architecture:** Introduire un concept de **fenêtre** (`WindowDef`) dans `src/config/site.ts` qui regroupe une semaine, son mois/année et son niveau de préférence (`preferred`/`fallback`). Chaque `DayDef` porte son `month`/`year` (dénormalisés) pour que la résolution de date depuis une clé reste auto-suffisante. Un helper `allDays()` aplatit les fenêtres pour les consommateurs existants ; `VoteGrid` itère directement sur les fenêtres pour rendre deux sections.

**Tech Stack:** Astro 5, React 18 + TS strict, Tailwind 3, Vitest, Playwright, Supabase.

## Global Constraints

- Format de clé de créneau `${dayId}__${slotId}` **inchangé** → le schéma Supabase ne change pas.
- Ne PAS lancer `astro add tailwind` (casserait la config Tailwind 3). Versions figées.
- Node 22 LTS (`.nvmrc`). Bilingue strict : toute chaîne FR a son équivalent EN.
- Honnêteté : aucune preuve sociale non réelle. Pas de mention « déjà confirmé par un membre du jury » tant que ce n'est pas vrai.
- `t.months` et `t.weekdays` sont 1-indexés (`months[7]='juillet'`, `months[8]='août'`).
- Commandes de vérification : `npm run test` (Vitest), `npm run check` (astro check), `npm run test:e2e` (Playwright).

---

## File Structure

| Fichier | Responsabilité | Action |
| --- | --- | --- |
| `src/config/site.ts` | Source de vérité métier : fenêtres, jours, créneaux, helpers | Modifier (cœur) |
| `src/lib/datetime.ts` | Formatage des dates depuis un `DayDef` | Modifier |
| `src/lib/mailtoFallback.ts` | Ordre canonique + libellés (mailto/copie) | Modifier |
| `src/lib/voteAggregation.ts` | Matrice jours × créneaux (admin) | Modifier |
| `src/components/vote/VoteGrid.tsx` | Rendu du recueil → 2 sections | Modifier |
| `src/components/rsvp/RsvpForm.tsx` | Liste déroulante des créneaux RSVP | Modifier |
| `src/i18n/fr.ts`, `src/i18n/en.ts` | Copie (kicker, lead, titres, recoReason) | Modifier |
| `tests/unit/datetime.test.ts` | Tests formatage | Réécrire |
| `tests/unit/mailtoFallback.test.ts` | Tests ordre/libellés | Réécrire |
| `tests/unit/voteAggregation.test.ts` | Tests matrice | Réécrire |
| `tests/unit/site.test.ts` | Tests helpers config (nouveau) | Créer |
| `tests/e2e/home.spec.ts` | Test bout-en-bout | Modifier |
| `supabase/purge_anciens_creneaux.sql` | Purge des votes orphelins (manuel) | Créer |

---

## Task 1: Modèle de données + couche lib (config, datetime, mailto, aggregation)

Les fichiers `site.ts`, `datetime.ts`, `mailtoFallback.ts`, `voteAggregation.ts` sont couplés à la compilation (tous référencent `SITE.days` / `SITE.defenseMonth` / `SITE.confirmed`). On les traite en un seul cycle TDD pour garder le build et les tests unitaires verts.

**Files:**
- Modify: `src/config/site.ts`
- Modify: `src/lib/datetime.ts`
- Modify: `src/lib/mailtoFallback.ts:23-38` (`orderSlotKeys`, `describeSlot`)
- Modify: `src/lib/voteAggregation.ts:36-46` (`aggregateMatrix`)
- Test: `tests/unit/site.test.ts` (créer), `tests/unit/datetime.test.ts`, `tests/unit/mailtoFallback.test.ts`, `tests/unit/voteAggregation.test.ts` (réécrire)

**Interfaces:**
- Produces:
  - `type WindowTier = 'preferred' | 'fallback'`
  - `interface WindowDef { id: string; tier: WindowTier; month: number; year: number; titleFr: string; titleEn: string; noteFr: string; noteEn: string; days: DayDef[] }`
  - `interface DayDef { id: string; dow: number; dom: number; month: number; year: number; avoid?: boolean }`
  - `SITE.windows: WindowDef[]` (remplace `SITE.days`, `SITE.defenseMonth`, `SITE.defenseYear`, `SITE.confirmed`)
  - `allDays(): DayDef[]`, `allSlotKeys(): SlotKey[]`, `dayById(id): DayDef | undefined`, `windowOfDay(dayId): WindowDef | undefined`
  - `formatDayFull(day, lang)` / `formatDayDate(day, lang)` lisent `day.month` / `day.year` (signatures inchangées)

- [ ] **Step 1: Écrire les tests config qui échouent** — créer `tests/unit/site.test.ts`

```ts
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
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npx vitest run tests/unit/site.test.ts`
Expected: FAIL (compilation — `allDays`, `windowOfDay`, `SITE.windows` inexistants)

- [ ] **Step 3: Réécrire `src/config/site.ts`**

Remplacer intégralement le contenu par :

```ts
/**
 * CONFIGURATION MÉTIER : source unique, typée et documentée.
 * Deux fenêtres de soutenance hiérarchisées (privilégiée / repli).
 */

export type Role = 'jury' | 'invite';
export type Presence = 'oui' | 'peut_etre';
export type WindowTier = 'preferred' | 'fallback';

export interface DayDef {
  /** Identifiant stable utilisé dans les clés de créneau et en base. */
  id: string;
  /** Jour de la semaine (1 = lundi … 7 = dimanche). */
  dow: number;
  /** Quantième du mois. */
  dom: number;
  /** Mois (1-12) — dénormalisé depuis la fenêtre pour le formatage des dates. */
  month: number;
  /** Année — dénormalisée depuis la fenêtre. */
  year: number;
  /** Vrai si le jour est « à éviter » (grisé mais sélectionnable). */
  avoid?: boolean;
}

export interface SlotDef {
  id: string;
  sh: number;
  eh: number;
}

/** Clé canonique d'un créneau : `${dayId}__${slotId}` (ex. `lun20__s9`). */
export type SlotKey = string;

export interface WindowDef {
  /** Identifiant stable de la fenêtre. */
  id: string;
  /** Niveau de préférence : privilégiée ou repli. */
  tier: WindowTier;
  /** Mois (1-12) de la semaine. */
  month: number;
  /** Année de la semaine. */
  year: number;
  /** Titre de section. */
  titleFr: string;
  titleEn: string;
  /** Message honnête expliquant le statut de la fenêtre. */
  noteFr: string;
  noteEn: string;
  /** Jours proposés dans cette fenêtre. */
  days: DayDef[];
}

export const SITE = {
  /** Adresse universitaire de réception des disponibilités (fallback mailto). */
  email: 'pierre.gil2@etu.univ-lyon1.fr',

  /** Candidat (auteur de la thèse). */
  author: {
    name: 'Pierre Gil',
    linkedin: 'https://www.linkedin.com/in/pierre-gil/',
  },

  /**
   * Fenêtres de soutenance proposées, par ordre de préférence.
   * - sem-juillet (privilégiée) : la faculté ferme le 25 juillet.
   * - sem-aout (repli) : uniquement si aucune disponibilité commune en juillet.
   */
  windows: [
    {
      id: 'sem-juillet',
      tier: 'preferred',
      month: 7,
      year: 2026,
      titleFr: 'Semaine privilégiée — 20 au 24 juillet 2026',
      titleEn: 'Preferred week — 20 to 24 July 2026',
      noteFr: 'Semaine privilégiée pour la soutenance.',
      noteEn: 'Preferred week for the defense.',
      days: [
        { id: 'lun20', dow: 1, dom: 20, month: 7, year: 2026 },
        { id: 'mar21', dow: 2, dom: 21, month: 7, year: 2026 },
        { id: 'mer22', dow: 3, dom: 22, month: 7, year: 2026 },
        { id: 'jeu23', dow: 4, dom: 23, month: 7, year: 2026 },
        { id: 'ven24', dow: 5, dom: 24, month: 7, year: 2026, avoid: true },
      ],
    },
    {
      id: 'sem-aout',
      tier: 'fallback',
      month: 8,
      year: 2026,
      titleFr: 'Repli — 17 au 21 août 2026',
      titleEn: 'Fallback — 17 to 21 August 2026',
      noteFr:
        'Uniquement si aucune disponibilité commune en juillet — la faculté est fermée du 25 juillet au 17 août.',
      noteEn:
        'Only if no common availability in July — the faculty is closed from 25 July to 17 August.',
      days: [
        { id: 'lun17', dow: 1, dom: 17, month: 8, year: 2026 },
        { id: 'mar18', dow: 2, dom: 18, month: 8, year: 2026 },
        { id: 'mer19', dow: 3, dom: 19, month: 8, year: 2026 },
        { id: 'jeu20', dow: 4, dom: 20, month: 8, year: 2026 },
        { id: 'ven21', dow: 5, dom: 21, month: 8, year: 2026, avoid: true },
      ],
    },
  ] satisfies WindowDef[],

  /** Créneaux de 2 h. */
  slots: [
    { id: 's9', sh: 9, eh: 11 },
    { id: 's11', sh: 11, eh: 13 },
    { id: 's14', sh: 14, eh: 16 },
    { id: 's16', sh: 16, eh: 18 },
  ] satisfies SlotDef[],

  /**
   * Créneaux recommandés (halo + badge) : nudge d'organisation pour converger vite
   * vers la fenêtre privilégiée. PAS une preuve sociale (aucune confirmation réelle codée).
   */
  recommendedSlots: ['lun20__s9', 'mar21__s9'] as SlotKey[],

  /** Lieu de la soutenance. */
  venue: {
    name: 'ISPB, Faculté de Pharmacie de Lyon',
    address: '8 avenue Rockefeller, 69373 Lyon Cedex 08',
    capacity: 60,
  },

  /**
   * Date verrouillée de la soutenance. `null` tant qu'elle n'est pas fixée.
   * Quand connue : { startISO: '2026-07-20T09:00:00', durationMin: 120, room: 'Amphi A' }.
   */
  defenseDate: null as null | { startISO: string; durationMin: number; room?: string },

  /** Composition du jury (référence ; affichée le jour J seulement). */
  jury: [
    { name: 'Pr Hans-Martin Spath', roleFr: 'Président', roleEn: 'President' },
    { name: 'Pr Maryem Rhanoui', roleFr: 'Directrice de thèse', roleEn: 'Thesis director' },
    { name: 'Dr François Claron', roleFr: 'Membre', roleEn: 'Member' },
    { name: 'Dr Matthieu Lebrat', roleFr: 'Membre', roleEn: 'Member' },
    { name: 'Dr Rachel Megard', roleFr: 'Membre', roleEn: 'Member' },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers dérivés (purs)                                              */
/* ------------------------------------------------------------------ */

/** Construit une clé de créneau. */
export function slotKey(dayId: string, slotId: string): SlotKey {
  return `${dayId}__${slotId}`;
}

/** Décompose une clé en { dayId, slotId }. */
export function splitKey(key: SlotKey): { dayId: string; slotId: string } {
  const [dayId, slotId] = key.split('__');
  return { dayId, slotId };
}

/** Tous les jours, toutes fenêtres confondues, dans l'ordre d'affichage. */
export function allDays(): DayDef[] {
  return SITE.windows.flatMap((w) => w.days);
}

/** Toutes les clés de créneau valides (jour × slot), dans l'ordre d'affichage. */
export function allSlotKeys(): SlotKey[] {
  return allDays().flatMap((d) => SITE.slots.map((s) => slotKey(d.id, s.id)));
}

export function dayById(id: string): DayDef | undefined {
  return allDays().find((d) => d.id === id);
}

export function slotById(id: string): SlotDef | undefined {
  return SITE.slots.find((s) => s.id === id);
}

/** Fenêtre contenant un jour donné (pour résoudre le tier). */
export function windowOfDay(dayId: string): WindowDef | undefined {
  return SITE.windows.find((w) => w.days.some((d) => d.id === dayId));
}

export function isRecommendedSlot(key: SlotKey): boolean {
  return SITE.recommendedSlots.includes(key);
}
```

- [ ] **Step 4: Mettre à jour `src/lib/datetime.ts`** — lire `day.month` / `day.year` au lieu des scalaires

```ts
import type { Lang } from '@/i18n';
import { useTranslations } from '@/i18n';
import type { DayDef, SlotDef } from '@/config/site';

/** « Lundi 20 juillet 2026 » / « Monday, 20 July 2026 ». */
export function formatDayFull(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  const wd = t.weekdays[day.dow];
  const mo = t.months[day.month];
  return lang === 'fr'
    ? `${wd} ${day.dom} ${mo} ${day.year}`
    : `${wd}, ${day.dom} ${mo} ${day.year}`;
}

/** Jour de la semaine seul (« Lundi »). */
export function formatWeekday(day: DayDef, lang: Lang): string {
  return useTranslations(lang).weekdays[day.dow];
}

/** Quantième + mois (« 20 juillet »). */
export function formatDayDate(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  return `${day.dom} ${t.months[day.month]}`;
}

/** Créneau : « 9 h–11 h » (FR) / « 9:00–11:00 » (EN). */
export function formatSlot(slot: SlotDef, lang: Lang): string {
  return lang === 'fr' ? `${slot.sh} h–${slot.eh} h` : `${slot.sh}:00–${slot.eh}:00`;
}
```

- [ ] **Step 5: Mettre à jour `src/lib/mailtoFallback.ts`** — `orderSlotKeys` itère sur `allDays()`

Modifier l'import (ligne 4-11) pour ajouter `allDays` :

```ts
import {
  SITE,
  allDays,
  dayById,
  slotById,
  splitKey,
  isRecommendedSlot,
  type Role,
  type SlotKey,
} from '@/config/site';
```

Et le corps de `orderSlotKeys` (ligne 26) :

```ts
  for (const d of allDays()) for (const s of SITE.slots) order.set(`${d.id}__${s.id}`, i++);
```

(`describeSlot` reste inchangé : il appelle déjà `dayById` + `formatDayFull`.)

- [ ] **Step 6: Mettre à jour `src/lib/voteAggregation.ts`** — `aggregateMatrix` itère sur `allDays()`

Vérifier l'import en tête de fichier et ajouter `allDays` à la liste importée depuis `@/config/site`, puis remplacer ligne 37 :

```ts
export function aggregateMatrix(map: Record<SlotKey, number>): MatrixRow[] {
  return allDays().map((day) => ({
    day,
    cells: SITE.slots.map((slot) => {
      const key = slotKey(day.id, slot.id);
      return { slot, key, n: map[key] ?? 0, recommended: isRecommendedSlot(key) };
    }),
  }));
}
```

- [ ] **Step 7: Réécrire `tests/unit/datetime.test.ts`** (couvre juillet ET août)

```ts
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
  it('formate une date d’août (fenêtre de repli)', () => {
    expect(formatDayFull(lun17, 'fr')).toBe('Lundi 17 août 2026');
    expect(formatDayFull(lun17, 'en')).toBe('Monday, 17 August 2026');
  });
});
```

- [ ] **Step 8: Réécrire `tests/unit/mailtoFallback.test.ts`** avec les nouvelles clés

```ts
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
  it('classe les créneaux d’août après ceux de juillet', () => {
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
  it('liste les créneaux dans l’ordre canonique', () => {
    const iLun = txt.indexOf('Lundi 20');
    const iMar = txt.indexOf('Mardi 21');
    expect(iLun).toBeGreaterThanOrEqual(0);
    expect(iMar).toBeGreaterThanOrEqual(0);
    expect(iLun).toBeLessThan(iMar);
  });
});

describe('buildMailto', () => {
  it('produit une URL mailto encodée vers l’adresse universitaire', () => {
    const url = buildMailto({ name: 'Jean', role: 'invite', slots: ['lun20__s9'], lang: 'fr' });
    expect(url.startsWith('mailto:pierre.gil2@etu.univ-lyon1.fr')).toBe(true);
    expect(url).toContain('subject=');
    const body = decodeURIComponent(url.split('body=')[1] ?? '');
    expect(body).toContain('Lundi 20 juillet 2026');
  });
});
```

- [ ] **Step 9: Réécrire `tests/unit/voteAggregation.test.ts`** (10 jours désormais)

```ts
import { describe, it, expect } from 'vitest';
import {
  countsToMap,
  aggregateMatrix,
  maxCount,
  bestKeys,
  totalAvailability,
} from '@/lib/voteAggregation';

describe('countsToMap', () => {
  it('transforme la liste en table clé → nombre', () => {
    expect(countsToMap([{ creneau: 'lun20__s9', n_dispo: 3 }])).toEqual({ lun20__s9: 3 });
  });
});

describe('aggregateMatrix', () => {
  it('produit 10 jours × 4 créneaux, avec les compteurs et les drapeaux recommandés', () => {
    const m = aggregateMatrix({ lun20__s9: 3, mar21__s9: 2 });
    expect(m).toHaveLength(10);
    m.forEach((row) => expect(row.cells).toHaveLength(4));
    const monday = m.find((r) => r.day.id === 'lun20')?.cells.find((c) => c.slot.id === 's9');
    const tuesday = m.find((r) => r.day.id === 'mar21')?.cells.find((c) => c.slot.id === 's9');
    expect(monday?.n).toBe(3);
    expect(monday?.recommended).toBe(true);
    expect(tuesday?.n).toBe(2);
    expect(tuesday?.recommended).toBe(true);
  });
});

describe('maxCount / bestKeys / totalAvailability', () => {
  const map = { mar21__s9: 3, lun20__s9: 1 };
  it('calcule le maximum', () => expect(maxCount(map)).toBe(3));
  it('identifie la ou les clés gagnantes', () => expect(bestKeys(map)).toEqual(['mar21__s9']));
  it('somme toutes les disponibilités', () => expect(totalAvailability(map)).toBe(4));
  it('ne retourne aucune clé quand tout est à zéro', () => expect(bestKeys({ a: 0 })).toEqual([]));
});
```

- [ ] **Step 10: Lancer tous les tests unitaires**

Run: `npx vitest run tests/unit/site.test.ts tests/unit/datetime.test.ts tests/unit/mailtoFallback.test.ts tests/unit/voteAggregation.test.ts`
Expected: PASS (tous)

- [ ] **Step 11: Commit**

```bash
git add src/config/site.ts src/lib/datetime.ts src/lib/mailtoFallback.ts src/lib/voteAggregation.ts tests/unit/site.test.ts tests/unit/datetime.test.ts tests/unit/mailtoFallback.test.ts tests/unit/voteAggregation.test.ts
git commit -m "feat: modèle 2 fenêtres (juillet privilégiée / août repli) + helpers allDays"
```

---

## Task 2: UI — deux sections dans VoteGrid + RsvpForm

**Files:**
- Modify: `src/components/vote/VoteGrid.tsx:260-298` (boucle des jours → boucle des fenêtres)
- Modify: `src/components/rsvp/RsvpForm.tsx:24-33` (`slotOptions`)

**Interfaces:**
- Consumes: `SITE.windows`, `allDays`, `windowOfDay` de Task 1 ; `formatWeekday`, `formatDayDate`, `formatDayFull`, `formatSlot` (signatures inchangées).

- [ ] **Step 1: Remplacer la grille de jours par une boucle de fenêtres dans `VoteGrid.tsx`**

Remplacer le bloc `<div className="vote-grid"> … </div>` (lignes 260-298) par un rendu section-par-fenêtre. Le bloc `confirmed` est supprimé (plus de `SITE.confirmed[key]`).

```tsx
        {SITE.windows.map((window) => (
          <section
            key={window.id}
            className={window.tier === 'fallback' ? 'mt-8 opacity-80' : 'mt-2'}
            aria-label={lang === 'fr' ? window.titleFr : window.titleEn}
          >
            <div className="mb-3">
              <h4
                className={`font-display text-lg ${
                  window.tier === 'fallback' ? 'text-ink-600' : 'text-ink-900'
                }`}
              >
                {lang === 'fr' ? window.titleFr : window.titleEn}
              </h4>
              <p className="mt-1 text-sm text-ink-500">
                {lang === 'fr' ? window.noteFr : window.noteEn}
              </p>
            </div>
            <div className="vote-grid">
              {window.days.map((day) => (
                <div className="day-col" key={day.id}>
                  <div className="day-head">
                    <div>
                      <div className="day-name">{formatWeekday(day, lang)}</div>
                      <div className="day-date">{formatDayDate(day, lang)}</div>
                    </div>
                    {day.avoid && <span className="day-flag">{t.avoidFlag}</span>}
                  </div>
                  <div className="day-slots">
                    {SITE.slots.map((slot) => {
                      const key = slotKey(day.id, slot.id);
                      const recommended = isRecommendedSlot(key);
                      const ariaLabel =
                        `${formatDayFull(day, lang)}, ${formatSlot(slot, lang)}` +
                        (recommended ? `, ${t.recoReason}` : '') +
                        (day.avoid ? `, ${t.avoidFlag}` : '');
                      return (
                        <SlotCard
                          key={key}
                          label={formatSlot(slot, lang)}
                          ariaLabel={ariaLabel}
                          selected={selected.has(key)}
                          recommended={recommended}
                          avoid={Boolean(day.avoid)}
                          count={counts[key] ?? 0}
                          t={t}
                          onToggle={() => toggle(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
```

> Note : `SlotCard` n'a plus les props `confirmedLabel` / `confirmedAvatars`. Vérifier que `SlotCard` accepte leur absence (props optionnelles). Si `SlotCard` les attend obligatoirement, les rendre optionnelles dans `SlotCard.tsx` — ne pas supprimer la logique d'affichage interne, juste rendre les props facultatives.

- [ ] **Step 2: Vérifier les props optionnelles de SlotCard**

Run: `grep -n "confirmedLabel\|confirmedAvatars" src/components/vote/SlotCard.tsx`
Si les props ne sont pas déjà `?:` optionnelles, les marquer optionnelles dans l'interface des props de `SlotCard.tsx` (ex. `confirmedLabel?: string; confirmedAvatars?: string[];`).

- [ ] **Step 3: Mettre à jour `slotOptions` dans `RsvpForm.tsx`**

Modifier l'import ligne 3 pour ajouter `allDays`, puis remplacer `SITE.days` ligne 26 par `allDays()` :

```tsx
import { SITE, allDays, slotKey, type Presence } from '@/config/site';
```
```tsx
  const slotOptions = useMemo(
    () =>
      allDays().flatMap((d) =>
        SITE.slots.map((s) => ({
          key: slotKey(d.id, s.id),
          label: `${formatDayFull(d, lang)} · ${formatSlot(s, lang)}`,
        })),
      ),
    [lang],
  );
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run check`
Expected: PASS (aucune erreur TS ; plus aucune référence à `SITE.days`, `SITE.defenseMonth`, `SITE.confirmed`)

- [ ] **Step 5: Commit**

```bash
git add src/components/vote/VoteGrid.tsx src/components/rsvp/RsvpForm.tsx src/components/vote/SlotCard.tsx
git commit -m "feat: VoteGrid rend deux sections hiérarchisées (privilégiée/repli)"
```

---

## Task 3: Copie i18n + recoReason + e2e

**Files:**
- Modify: `src/i18n/fr.ts` (kicker l.27, lead l.78, homeTitle l.221, `recoReason`)
- Modify: `src/i18n/en.ts` (kicker l.24, lead l.75, homeTitle l.215, `recoReason`)
- Modify: `tests/e2e/home.spec.ts:11,24`

**Interfaces:**
- Consumes: clés i18n existantes ; aucune nouvelle clé structurelle (les titres/notes de section vivent dans `SITE.windows`).

- [ ] **Step 1: Localiser `recoReason` dans les deux langues**

Run: `grep -n "recoReason" src/i18n/fr.ts src/i18n/en.ts`
Expected: une ligne par fichier (texte actuel mentionnant « déjà confirmé par un membre du jury »).

- [ ] **Step 2: Mettre à jour `src/i18n/fr.ts`**

- `recoReason` → `'Créneau à privilégier pour réunir tout le monde plus vite.'`
- kicker (l.27) → `kicker: 'Soutenance de thèse · Été 2026 · ISPB Lyon',`
- lead (l.78) → `lead: 'Cochez tous les créneaux qui vous conviennent. La semaine du 20 au 24 juillet 2026 est privilégiée ; la semaine du 17 au 21 août n’est qu’un repli si aucune date commune n’émerge en juillet. Plus vous cochez de créneaux, plus il sera simple de réunir tout le monde.',`
- homeTitle (l.221) → `homeTitle: 'Ouvrir la boîte noire · Soutenance de thèse · ISPB Lyon · Été 2026',`

- [ ] **Step 3: Mettre à jour `src/i18n/en.ts`**

- `recoReason` → `'Slot to prioritise so everyone can be gathered sooner.'`
- kicker (l.24) → `kicker: 'Thesis defense · Summer 2026 · ISPB Lyon',`
- lead (l.75) → `lead: 'Tick every time slot that works for you. The week of 20–24 July 2026 is preferred; the week of 17–21 August is only a fallback if no common date emerges in July. The more you tick, the easier it is to bring everyone together.',`
- homeTitle (l.215) → `homeTitle: 'Opening the black box · Thesis defense · ISPB Lyon · Summer 2026',`

> Choix assumé : la prose narrative du hero (« En juillet 2026, à l’ISPB… » / « July 2026, at the ISPB… », fr l.33 / en l.30) décrit le thème de la thèse, pas la logistique de planning. La fenêtre privilégiée étant juillet, on la conserve telle quelle.

- [ ] **Step 4: Mettre à jour `tests/e2e/home.spec.ts`**

Remplacer les références à l'ancien créneau confirmé par le nouveau créneau recommandé.

- Ligne 11 : `name: 'Lundi 20 juillet 2026, 9 h–11 h, Créneau à privilégier pour réunir tout le monde plus vite.',`
- Ligne 24 : `await expect(page.locator('[aria-live="polite"]').getByText(/Lundi 20 juillet 2026/)).toBeVisible();`

> Si le test sélectionne le créneau via ce `name` (aria-label) puis vérifie le récapitulatif, l'aria-label doit correspondre exactement à la concaténation produite par `VoteGrid` : `${formatDayFull}, ${formatSlot}, ${t.recoReason}`. Ajuster la chaîne attendue si le test échoue sur un écart de ponctuation.

- [ ] **Step 5: Vérifier qu’aucune date obsolète ne subsiste**

Run: `grep -rniE "6 au 10|6–10|mar7|jeu9|lun6|mer8|ven10|déjà confirmé" src/ tests/`
Expected: aucun résultat (hors fichiers de plan/spec sous `docs/`).

- [ ] **Step 6: Suite complète**

Run: `npm run test && npm run check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/i18n/fr.ts src/i18n/en.ts tests/e2e/home.spec.ts
git commit -m "feat: copie i18n deux fenêtres + recoReason honnête + e2e"
```

---

## Task 4: Purge Supabase des votes orphelins (manuel, hors front)

Les votes enregistrés sur les anciens créneaux (`lun6__*`, `mar7__*`, …) sont orphelins. Ce script est **à exécuter manuellement** par Pierre dans l'éditeur SQL Supabase ; il n'est pas joué par le déploiement front.

**Files:**
- Create: `supabase/purge_anciens_creneaux.sql`

- [ ] **Step 1: Créer le script SQL de purge**

```sql
-- Purge des disponibilités recueillies sur les anciens créneaux (semaine du 6-10 juillet).
-- À exécuter manuellement dans l'éditeur SQL Supabase AVANT la mise en ligne des nouvelles dates.
-- Repart à zéro, sans preuve sociale (décision de cadrage 2026-06-19).

-- 1. Inspecter ce qui sera supprimé (lecture seule) :
select id, nom, role, creneaux, created_at from public.disponibilites;

-- 2. Supprimer toutes les réponses de disponibilités (repart à zéro) :
delete from public.disponibilites;

-- 3. (Optionnel) Réinitialiser les RSVP si leur créneau préféré pointe sur l'ancienne grille :
--    À n'exécuter que si l'on souhaite aussi repartir à zéro côté RSVP.
-- delete from public.rsvp;

-- 4. Vérifier que les compteurs agrégés sont revenus à zéro :
select * from public.creneau_counts order by creneau;
```

> Note : adapter les noms de tables/colonnes si le schéma réel diffère (voir `supabase/` du dépôt). La table `creneau_counts` se met normalement à jour via trigger sur `disponibilites` ; si ce n'est pas le cas, vider aussi `creneau_counts` explicitement.

- [ ] **Step 2: Commit**

```bash
git add supabase/purge_anciens_creneaux.sql
git commit -m "chore: script SQL de purge des votes orphelins (manuel)"
```

---

## Self-Review

**Spec coverage :**
- §1 Modèle de données (WindowDef, DayDef +month/year, suppression defenseMonth/Year/confirmed, recommendedSlots) → Task 1 ✅
- §2 Helpers (allDays/allSlotKeys/dayById/windowOfDay) → Task 1 ✅
- §3 UI deux sections → Task 2 ✅
- §4 Notes honnêtes → portées dans `SITE.windows` (Task 1), rendues en Task 2 ✅
- §5 Purge Supabase → Task 4 ✅
- §6 Audit defenseMonth/Year + datetime + tests + i18n → Tasks 1 & 3 ✅ (+ recoReason honnête, non listé au spec mais découlant de la décision « sans preuve sociale »)

**Placeholder scan :** aucun TBD/TODO ; tout le code est explicite. Les deux points « si le test échoue, ajuster » (Task 2 SlotCard, Task 3 e2e) sont des vérifications conditionnelles bornées, pas des placeholders.

**Type consistency :** `WindowDef`/`DayDef`/`allDays`/`windowOfDay` cohérents entre Task 1 (définition) et Tasks 2-3 (consommation). Clés (`lun20__s9`, `mar21__s9`) identiques partout. `recommendedSlots` aligné avec les tests.
