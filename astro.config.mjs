// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Stack pinnée (juin 2026) : Astro 5 + React 18 + Tailwind 3 via @astrojs/tailwind.
// NB : @astrojs/tailwind est déprécié au profit du plugin Vite de Tailwind 4 ; on
// reste volontairement en Tailwind 3 (config `tailwind.config.ts`). Ne PAS lancer
// `astro add tailwind` (installerait TW4 et casserait la config JS).
export default defineConfig({
  // Domaine final GitHub Pages (site utilisateur, servi à la racine).
  // Utilisé pour le sitemap et les URLs canoniques/OG.
  site: 'https://doctorsilver-xai.github.io',
  integrations: [
    react(),
    mdx(),
    // applyBaseStyles:false → on contrôle nous-mêmes les couches Tailwind dans global.css
    tailwind({ applyBaseStyles: false }),
    // Exclut les pages « discrètes » (/jury) du sitemap.
    sitemap({ filter: (page) => !page.includes('/jury') }),
  ],
  build: {
    // Inline les petites feuilles de style critiques pour de meilleurs Core Web Vitals.
    inlineStylesheets: 'auto',
  },
});
