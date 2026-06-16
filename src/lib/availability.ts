import { supabase } from './supabaseClient';
import type { SlotCount } from './voteAggregation';
import type { Presence, Role, SlotKey } from '@/config/site';

/** Synthèse RSVP renvoyée par la vue `rsvp_summary`. */
export interface RsvpSummary {
  n_oui: number;
  n_peut_etre: number;
  total_presents: number;
  capacite_salle: number;
  places_restantes: number;
  taux_occupation_pct: number;
}

/* ----------------------------- LECTURE (agrégats, zéro PII) ----------------------------- */

/** Compteurs de disponibilités par créneau (table `creneau_counts`). */
export async function fetchCreneauCounts(): Promise<SlotCount[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('creneau_counts')
    .select('creneau, n_dispo')
    .order('creneau');
  if (error) throw error;
  return (data ?? []) as SlotCount[];
}

/** Synthèse RSVP (vue `rsvp_summary`, 1 ligne). */
export async function fetchRsvpSummary(): Promise<RsvpSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('rsvp_summary').select('*').single();
  if (error) throw error;
  return data as RsvpSummary;
}

/**
 * Indique si un membre du jury a DÉJÀ transmis ses disponibilités.
 * Appelle la fonction RPC `jury_has_submitted` (SECURITY DEFINER) qui ne renvoie
 * qu'un booléen : aucun nom, aucune donnée nominative n'est exposée au client.
 * Sans backend configuré, renvoie `false` (le garde-fou « déjà voté » est inactif en local).
 */
export async function hasJurySubmitted(nom: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('jury_has_submitted', { p_nom: nom });
  if (error) throw error;
  return Boolean(data);
}

/* ----------------------------- ÉCRITURE (INSERT anon) ----------------------------- */

export interface DisponibiliteInput {
  nom: string;
  role: Role;
  creneaux: SlotKey[];
  commentaire?: string | null;
}

/** Insère une réponse de disponibilité. anon n'a PAS de SELECT → on n'enchaîne pas `.select()`. */
export async function submitDisponibilite(input: DisponibiliteInput): Promise<void> {
  if (!supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('disponibilites').insert(input);
  if (error) throw error;
}

export interface RsvpInput {
  nom: string;
  nb_accompagnants: number;
  presence: Presence;
  creneau_prefere?: string | null;
  email?: string | null;
}

export async function submitRsvp(input: RsvpInput): Promise<void> {
  if (!supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('rsvp').insert(input);
  if (error) throw error;
}

/* ----------------------------- TEMPS RÉEL (compteurs agrégés) ----------------------------- */

/** S'abonne aux changements de compteurs de créneaux. Renvoie une fonction de désabonnement. */
export function subscribeCreneauCounts(onChange: (row: SlotCount) => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('rt-creneau-counts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'creneau_counts' },
      (payload) => {
        // INSERT/UPDATE -> payload.new ; DELETE -> payload.old. On couvre les deux.
        const row =
          payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        if (row) onChange(row as SlotCount);
      },
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

/** S'abonne aux changements du compteur RSVP (déclenche un re-fetch de la synthèse). */
export function subscribeRsvpSummary(onChange: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('rt-rsvp-counters')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rsvp_counters' },
      () => onChange(),
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
