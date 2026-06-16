import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Contenu pédagogique du scrollytelling (« Le sujet »), en MDX, séparé de la
 * présentation. Une entrée par palier et par langue. La langue est explicite
 * dans le frontmatter (plus robuste que de la déduire du chemin).
 */
const scrollytelling = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/scrollytelling' }),
  schema: z.object({
    lang: z.enum(['fr', 'en']),
    /** Ordre du palier dans la narration. */
    order: z.number().int().positive(),
    /** Sur-titre court (ex. « Le problème »). */
    eyebrow: z.string(),
    /** Titre du palier. */
    title: z.string(),
    /** Niveau 1 : résumé accessible (2–3 phrases). */
    summary: z.string(),
    /** Intitulé du bloc repliable (défaut géré côté composant). */
    deepDiveTitle: z.string().optional(),
  }),
});

export const collections = { scrollytelling };
