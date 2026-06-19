-- =====================================================================
-- Migration : two_windows_slot_keys
-- Date      : 2026-06-19
-- Décision  : Cadrage final des fenêtres de soutenance.
--
-- Contexte
-- --------
-- La semaine du 6-10 juillet 2026 (lun6/mar7/mer8/jeu9/ven10) est abandonnée.
-- Deux nouvelles fenêtres sont retenues :
--   • Fenêtre privilégiée : 20-24 juillet 2026 (lun20/mar21/mer22/jeu23/ven24)
--   • Fenêtre de repli    : 17-21 août 2026    (lun17/mar18/mer19/jeu20/ven21)
-- Les slots restent inchangés : s9 / s11 / s14 / s16.
-- Cela donne 10 jours × 4 slots = 40 clés de créneaux.
--
-- Impact technique
-- ----------------
-- La fonction `app_private.valid_slot_keys()` est la source de vérité
-- consommée par les CHECK constraints de :
--   • public.disponibilites (colonne creneaux)
--   • public.rsvp (colonne creneau_prefere)
--   • public.creneau_counts (clé primaire creneau)
-- … et par les politiques RLS d'insertion.
-- Remplacer la fonction (CREATE OR REPLACE) suffit à mettre à jour
-- toutes ces validations en cascade. Les contraintes elles-mêmes
-- n'ont PAS besoin d'être recréées.
--
-- Redémarrage à zéro
-- ------------------
-- Décision du 2026-06-19 : pas de preuve sociale conservée.
-- Les données collectées sous l'ancienne grille (lun6__* etc.) sont
-- supprimées. Les compteurs sont remis à zéro manuellement (les triggers
-- sont AFTER INSERT seulement — un DELETE ne décrémente pas).
-- Cette migration est le chemin autoritatif et supersède le script
-- one-shot `supabase/purge_anciens_creneaux.sql` (désormais supprimé).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Mise à jour du référentiel de clés de créneaux.
--    Deux fenêtres × 4 slots = 40 clés.
-- ---------------------------------------------------------------------
create or replace function app_private.valid_slot_keys()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array(
    select d || '__' || s
    from unnest(array['lun20','mar21','mer22','jeu23','ven24',
                      'lun17','mar18','mer19','jeu20','ven21']) as d
    cross join unnest(array['s9','s11','s14','s16']) as s
  );
$$;

-- ---------------------------------------------------------------------
-- 2. Suppression des données collectées sous l'ancienne grille.
--    Les lignes référencent des clés désormais invalides (lun6__* etc.).
--    Repart à zéro : pas de migration partielle, pas de preuve sociale.
-- ---------------------------------------------------------------------
delete from public.disponibilites;
delete from public.rsvp;

-- ---------------------------------------------------------------------
-- 3. Reconstruction de public.creneau_counts pour les 40 nouvelles clés.
--    On vide d'abord (les anciennes clés ne passent plus le CHECK après
--    la mise à jour de valid_slot_keys), puis on réinsère une ligne à 0
--    par nouvelle clé. Pattern identique au seed initial de 0001.
-- ---------------------------------------------------------------------
delete from public.creneau_counts;

insert into public.creneau_counts (creneau, n_dispo)
select k, 0 from unnest(app_private.valid_slot_keys()) as k
on conflict (creneau) do nothing;

-- ---------------------------------------------------------------------
-- 4. Remise à zéro des compteurs RSVP (singleton id = 1).
--    Les triggers sont AFTER INSERT : DELETE ne décrémente pas.
--    Réinitialisation manuelle requise. capacite_salle (60) est conservé.
-- ---------------------------------------------------------------------
update public.rsvp_counters
   set n_oui          = 0,
       n_peut_etre    = 0,
       total_presents = 0,
       updated_at     = now()
 where id = 1;

-- ---------------------------------------------------------------------
-- 5. Passage des caps de cardinalité de 20 à 40.
--    La grille compte désormais deux fenêtres × 5 jours × 4 slots = 40 clés.
--    Deux endroits dans 0001 plafonnaient à 20 et doivent être mis à jour :
--      a) la CHECK constraint de table sur disponibilites.creneaux
--      b) la politique RLS anon_insert_disponibilites (WITH CHECK)
-- ---------------------------------------------------------------------

-- 5a. Contrainte CHECK de table (drop + re-add, pas d'ALTER CHECK en place).
alter table public.disponibilites
  drop constraint disponibilites_creneaux_card_chk,
  add  constraint disponibilites_creneaux_card_chk
    check (cardinality(creneaux) between 0 and 40);

-- 5b. Politique RLS INSERT anon (corps reproduit à l'identique depuis 0001,
--     seule la ligne cardinality passe de 20 à 40).
drop policy if exists "anon_insert_disponibilites" on public.disponibilites;
create policy "anon_insert_disponibilites"
  on public.disponibilites
  for insert
  to anon
  with check (
    role in ('jury','invite')
    and char_length(nom) between 1 and 120
    and (commentaire is null or char_length(commentaire) <= 1000)
    and cardinality(creneaux) between 0 and 40
    and creneaux <@ app_private.valid_slot_keys()
  );

commit;
