# Ouvrir la boîte noire — site de soutenance (ISPB Lyon)

Mini-site vitrine **et** outil de coordination pour la soutenance de thèse d'exercice de Pierre
(ISPB, Université Lyon 1, juillet 2026). Deux rôles :

1. **Recueillir** les disponibilités du jury et le RSVP des invités (Supabase + temps réel,
   avec repli e-mail si l'API n'est pas joignable) ;
2. **Donner envie de venir** — un teaser académique, sobre et pédagogique, à deux niveaux de
   lecture (accessible aux proches, crédible pour les spécialistes).

> Thèse : « Intelligence artificielle explicable et de confiance dans le diagnostic, le suivi
> personnalisé et l'optimisation thérapeutique du TDAH et du trouble bipolaire ». Sous-titre :
> « Du médicament aux dispositifs médicaux numériques : rôles, enjeux et opportunités inédites
> du pharmacien en santé mentale. »

## Sommaire du site

| Section | Rôle |
| --- | --- |
| **Hero** | Accroche + signature visuelle : carte d'« attention » animée (Canvas, IA explicable) |
| **Le sujet** (scrollytelling) | 3 paliers pédagogiques, lecture à deux niveaux (bloc « Pour aller plus loin » repliable) |
| **Pourquoi venir** | 3 cartes + fil translationnel « du médicament au dispositif numérique » |
| **Disponibilités** | Grille jours × créneaux + créneau recommandé justifié + dashboard de convergence (temps réel) |
| **RSVP** | Présence invités + compteur et jauge de capacité (temps réel) |
| **Jour J** | Programme / accès / `.ics` — activé quand la date est verrouillée (config) |

Pages : `/` et `/en/` (bilingue), plus `/jury` et `/en/jury` (page **discrète**, non indexée,
à partager par lien aux membres du jury).

## Stack

Astro 5 (statique) · îlots **React 18 + TypeScript strict** · **Tailwind 3** (design tokens) ·
contenu **MDX** (collections typées) · **Supabase** (Postgres + RLS + Realtime) · Canvas 2D ·
révélations au scroll via IntersectionObserver (respecte `prefers-reduced-motion`).

> **Choix de versions assumé.** On reste volontairement sur Astro 5 / Tailwind 3 / React 18
> (et non les « latest » Astro 6 / Tailwind 4 / React 19) : combo éprouvé, `tailwind.config.ts`
> conservé. `@astrojs/tailwind` est déprécié mais fonctionnel — **ne pas** lancer `astro add
> tailwind` (installerait Tailwind 4 et casserait la config JS).
>
> Pas de GSAP : les micro-animations passent par IntersectionObserver (plus léger, meilleure
> accessibilité). Node **22 LTS** pour le build/déploiement (cf. `.nvmrc`) — Node 25 local OK.

## Arborescence

```
src/
  pages/        index.astro · en/index.astro · jury.astro · en/jury.astro · 404.astro
  layouts/      BaseLayout.astro
  components/   hero/ scrollytelling/ why/ vote/ rsvp/ jourj/ nav/ footer/ pages/
  content/      scrollytelling/{fr,en}/*.mdx   (+ content.config.ts)
  config/       site.ts        (email, jours, créneaux, confirmés, date, capacité — typé)
  i18n/         fr.ts · en.ts · index.ts · paths.ts   (dictionnaires typés, 0 texte en dur)
  lib/          supabaseClient · availability · mailtoFallback · ics · voteAggregation · datetime
  styles/       tokens.css · global.css
supabase/       migrations/0001_thesis_defense_schema.sql · seed.sql
tests/          unit/ (Vitest) · e2e/ (Playwright)
docs/           SUPABASE.md
.github/workflows/ci.yml
```

## Prérequis

- **Node 22 LTS** (`nvm use` lit `.nvmrc`) et **pnpm 9** (`corepack enable pnpm`).

## Démarrer

```bash
pnpm install
cp .env.example .env      # renseigner les clés Supabase (ou laisser vide : repli mailto)
pnpm dev                  # http://localhost:4321
```

## Scripts

```bash
pnpm dev          # serveur de dev
pnpm build        # build statique -> dist/
pnpm preview      # sert le build
pnpm check        # astro check (types + .astro)
pnpm lint         # ESLint (flat config)
pnpm format       # Prettier
pnpm test         # tests unitaires (Vitest)
pnpm test:e2e     # tests E2E (Playwright)
```

## Variables d'environnement

Seules les variables `PUBLIC_*` sont exposées au navigateur (Astro). Clé **publishable**
(anon) uniquement — **jamais** la clé secrète ni le mot de passe DB (cf. `.env.example`).

```
PUBLIC_SUPABASE_URL=https://VOTRE-REF.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

Sans ces variables, le site **fonctionne quand même** : le module de vote et le RSVP basculent
sur un e-mail pré-rempli + « Copier le résumé ».

## Backend Supabase

Voir **[`docs/SUPABASE.md`](docs/SUPABASE.md)** — application de la migration et du seed via le
SQL Editor (≈ 2 min), RLS (aucun nom/e-mail lisible côté client), compteurs temps réel,
consultation nominative privée réservée à Pierre. La preuve sociale ne reflète que de **vrais**
votes (les 3 confirmations seedées sur mardi 7 juillet 9 h sont réelles).

## Tests

- **Vitest** (utilitaires purs) : conformité `.ics` (RFC 5545), génération mailto, agrégation des
  votes, formatage des dates, complétude i18n FR/EN.
- **Playwright** (parcours) : hero, créneau privilégié, sélection, récapitulatif, bascule FR/EN.

## Déploiement (URL gratuite et partageable)

### Netlify
- **Build command** : `pnpm build` · **Publish directory** : `dist`
- **Environment** : `NODE_VERSION=22`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
- Astro statique : aucun adaptateur requis. URL gratuite `xxx.netlify.app`.

### Vercel
- Framework détecté : **Astro** · Build `pnpm build` · Output `dist`
- **Settings → Environment Variables** : `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
  (et Node 22 dans _Project Settings_).

> Après déploiement : mettre à jour `site:` dans `astro.config.mjs` (sitemap + URLs canoniques),
> l'URL du `Sitemap:` dans `public/robots.txt`, et générer l'image Open Graph (`public/og.png`,
> 1200×630) — gabarit dans `public/og-template.html`.

## Personnalisation express

Tout le métier est dans **`src/config/site.ts`** : adresse e-mail, jours/créneaux, créneau
recommandé, confirmations réelles, capacité de salle, et **`defenseDate`** (passer de `null` à
`{ startISO, durationMin, room }` active la section « Jour J » et le bouton `.ics`).
Les textes vivent dans **`src/i18n/{fr,en}.ts`**.

## Éthique & accessibilité

- **Aucun dark pattern** : pas de case pré-cochée trompeuse, pas de faux compteur. La preuve
  sociale n'affiche que des compteurs réels ; le créneau recommandé l'est parce qu'il est **déjà
  confirmé** (justification visible).
- **Vie privée** : la page n'expose que des agrégats anonymes ; les noms restent privés (RLS).
- **Accessibilité** : contraste AA, navigation clavier, focus visibles, `aria-label`,
  `prefers-reduced-motion` respecté, no-JS friendly (le contenu reste lisible sans JavaScript).

## Checklist de mise en ligne

- [ ] `pnpm check`, `pnpm build`, `pnpm test` verts
- [ ] Migration + seed appliqués sur Supabase (`docs/SUPABASE.md`)
- [ ] **Secret key + mot de passe DB régénérés** (ils ont fuité dans un fichier de travail)
- [ ] Variables d'env définies sur l'hébergeur (clé publishable uniquement)
- [ ] `site:` (astro.config) + `robots.txt` mis à l'URL réelle · image OG générée
- [ ] Lien `/jury` partagé aux 5 membres du jury · relance avant le 15 juin

## Évolutions futures

Version EN déjà en place (à enrichir) · compte à rebours jour J · page « À propos » → portfolio
personnel · nom de domaine durable (ex. `pierregil.fr`).
