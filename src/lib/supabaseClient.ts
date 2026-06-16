import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase unique (singleton de module) pour tous les îlots React.
 * - N'utilise QUE la clé publishable (anon), conçue pour le navigateur (RLS active côté DB).
 * - Dégradation gracieuse : si les variables d'environnement sont absentes (build CI sans
 *   secrets, fork…), `supabase` vaut `null` et l'UI bascule sur le fallback mailto.
 * - `persistSession`/`autoRefreshToken` à false : pas d'authentification, aucun stockage local.
 */
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
