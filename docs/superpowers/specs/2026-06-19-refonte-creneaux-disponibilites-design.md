# Refonte des créneaux de disponibilité — Design

**Date :** 2026-06-19
**Contexte :** Le président du jury a indiqué qu'aucune soutenance n'est envisageable avant 
le **20 juillet 2026**, et la faculté est **fermée du 25 juillet au 17 août 2026**. Le système
de recueil de disponibilités du site de soutenance doit être entièrement reconfiguré pour
proposer au jury deux fenêtres hiérarchisées.

## Objectif

Passer d'**une semaine unique dans un seul mois** (lun 6 → ven 10 juillet, modèle actuel) à
**deux fenêtres dans deux mois différents avec une hiérarchie de préférence** :

- ✅ **Fenêtre privilégiée** : semaine du **lun 20 → ven 24 juillet 2026** (la fac ferme le 25).
- ⚠️ **Fenêtre de repli** (non souhaitable) : semaine du **lun 17 → ven 21 août 2026** (après réouverture).

Calendrier 2026 vérifié : le 20 juillet et le 17 août tombent tous deux un lundi.

## Décisions de cadrage (validées)

1. **Présentation** : deux sections hiérarchisées. Section privilégiée pleinement visible,
   section repli visuellement en retrait avec un message honnête expliquant la préférence.
2. **Données existantes** : repartir à zéro, **sans preuve sociale**. Suppression du bloc
   « déjà confirmé : Dr Claron » (codé sur l'ancien créneau mar 7 juillet) et purge des votes
   enregistrés sur les anciens créneaux.
3. **Créneaux recommandés** : conservés, sur la semaine de juillet uniquement (nudge
   d'organisation honnête, pas de fausse preuve sociale).
4. **Créneaux & vendredis** : 4 créneaux de 2 h inchangés (9-11, 11-13, 14-16, 16-18) sur
   chaque jour ; vendredi marqué « à éviter » dans les deux semaines.

## 1. Modèle de données (`src/config/site.ts`)

Introduction d'un concept de **fenêtre** (`window`) regroupant une semaine, son mois et son
niveau de préférence.

```ts
export type WindowTier = 'preferred' | 'fallback';

export interface WindowDef {
  id: string;              // 'sem-juillet' | 'sem-aout'
  tier: WindowTier;        // 'preferred' | 'fallback'
  month: number;           // 7 ou 8 → remplace le scalaire defenseMonth
  year: number;            // 2026
  titleFr: string; titleEn: string;   // « Semaine privilégiée » / « Repli »
  noteFr: string; noteEn: string;     // message honnête (voir §4)
  days: DayDef[];
}
```

- `DayDef` gagne `month: number` et `year: number` (dénormalisés depuis la fenêtre) → la
  résolution de date à partir d'une simple clé de créneau reste auto-suffisante pour
  `describeSlot` / `orderSlotKeys`.
- Les scalaires `defenseMonth` / `defenseYear` **disparaissent**. Tous les consommateurs sont
  audités et migrés vers `day.month` / `day.year` (voir §6).

**Arbitrage assumé :** la dénormalisation `month`/`year` sur chaque `DayDef` (en plus de la
fenêtre) est une légère redondance, choisie volontairement pour que la résolution date d'une
clé `${dayId}__${slotId}` ne nécessite aucun retour à la fenêtre parente. L'alternative « pure »
(passer le mois en argument aux formateurs) a été écartée : elle complique `describeSlot`, qui
ne reçoit qu'une clé.

**Données concrètes :**

| Fenêtre | tier | mois | Jours |
| --- | --- | --- | --- |
| `sem-juillet` | preferred | 7 | `lun20, mar21, mer22, jeu23, ven24`(avoid) |
| `sem-aout` | fallback | 8 | `lun17, mar18, mer19, jeu20, ven21`(avoid) |

- 4 créneaux identiques inchangés : `s9` (9-11), `s11` (11-13), `s14` (14-16), `s16` (16-18).
- `recommendedSlots: ['lun20__s9', 'mar21__s9']` (lundi/mardi matin de juillet).
- Bloc `confirmed` **supprimé** (objet vidé ou retiré + références nettoyées).
- `defenseDate` reste `null`.

Les `dayId` sont uniques entre les deux semaines (quantièmes différents) → pas de collision de
clés. Le format de clé `${dayId}__${slotId}` est **inchangé**, donc le schéma Supabase
(`disponibilites.creneaux`, `creneau_counts.creneau`) ne change pas.

## 2. Helpers dérivés (`site.ts`)

- `allSlotKeys()` et `dayById()` itèrent sur `SITE.windows.flatMap(w => w.days)` au lieu de
  `SITE.days`.
- `isRecommendedSlot()` inchangé.
- Helper optionnel `windowOfDay(dayId)` si la résolution du tier est nécessaire ailleurs.

## 3. UI (`src/components/vote/VoteGrid.tsx`)

Remplacer la boucle `SITE.days.map(...)` par `SITE.windows.map(window => …)` : chaque fenêtre
devient une **section** avec un en-tête (titre + note) suivi de sa grille de jours.

- Section `preferred` : pleine visibilité.
- Section `fallback` : visuellement en retrait (atténuée, en-tête « repli »).
- La grille interne réutilise `SlotCard` tel quel (aucune modification de la carte).

## 4. Honnêteté — notes de section

- **Privilégiée** : « Semaine privilégiée pour la soutenance. »
- **Repli** : « Uniquement si aucune disponibilité commune en juillet — la faculté est fermée
  du 25 juillet au 17 août. »

(EN équivalent dans `noteEn`.)

## 5. Données existantes (Supabase — hors front)

Purge des votes enregistrés sur les anciens créneaux (juillet 6-10, désormais orphelins) via
`seed.sql` ou un script de migration. **Action côté base, à exécuter séparément du déploiement
front.** Documentée ici comme prérequis ; non couverte par les modifications de code applicatif.

## 6. Audit des consommateurs & tests

- **Audit `defenseMonth` / `defenseYear`** : recenser toutes les références (`Hero.astro`,
  `Home.astro`, `Jury.astro`, `datetime.ts`, i18n…) et migrer vers le mois/année portés par la
  fenêtre ou le jour. Toute mention de « juillet 2026 » en dur doit refléter les deux fenêtres
  ou être généralisée.
- **`datetime.ts`** : `formatDayFull` / `formatDayDate` lisent `day.month` / `day.year`.
- **Tests Vitest** : mettre à jour ceux qui référencent les anciennes clés (`mar7__s9`,
  `jeu9__s9`, etc.) et le bloc `confirmed`.
- **i18n** : ajuster les chaînes nécessaires (libellés de section) ; titres/notes portés dans
  la config (cohérent avec le pattern FR/EN inline existant pour `confirmed`).

## Hors périmètre

- Schéma de base Supabase (inchangé).
- Composant `SlotCard` (réutilisé tel quel).
- Logique RSVP, temps réel, garde-fou « déjà voté » (inchangés).
- Verrouillage de la date finale (`defenseDate` reste `null`).
