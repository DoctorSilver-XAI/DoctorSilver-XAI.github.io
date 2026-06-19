-- =====================================================================
-- Script MANUEL de purge des disponibilités sur les anciens créneaux.
-- À exécuter dans l'éditeur SQL Supabase (rôle service_role ou postgres).
-- NE PAS intégrer dans le déploiement front — script one-shot.
--
-- Contexte : décision de cadrage 2026-06-19.
--   Les créneaux de la semaine du 6-10 juillet 2026 (lun6__*, mar7__*, mer8__*,
--   jeu9__*, ven10__*) sont abandonnés. La collecte repart à zéro sur les
--   nouvelles dates (semaine du 20-24 juillet, repli 17-21 août 2026),
--   SANS preuve sociale. Ce script supprime les données existantes AVANT
--   la mise en ligne de la nouvelle interface de collecte.
--
-- IMPORTANT — comportement des triggers :
--   Le trigger `trg_bump_creneau_counts` incrémente `public.creneau_counts`
--   à chaque INSERT dans `public.disponibilites`. Il N'Y A PAS de trigger
--   de décrémentation sur DELETE. Supprimer les lignes de `disponibilites`
--   ne remet PAS les compteurs à zéro automatiquement.
--   => Étape 3 ci-dessous réinitialise `creneau_counts` explicitement.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Inspecter ce qui sera supprimé (lecture seule — NE PAS modifier).
-- ---------------------------------------------------------------------
select
  id,
  nom,
  role,
  creneaux,
  created_at
from public.disponibilites
order by created_at;

-- Compteurs actuels (pour comparaison avant/après) :
select creneau, n_dispo
from public.creneau_counts
where n_dispo > 0
order by creneau;

-- ---------------------------------------------------------------------
-- 2. Supprimer toutes les disponibilités enregistrées (repart à zéro).
--    Exécuter cette étape SEULEMENT après avoir lu le résultat de l'étape 1.
-- ---------------------------------------------------------------------
delete from public.disponibilites;

-- ---------------------------------------------------------------------
-- 3. Réinitialiser les compteurs agrégés.
--    Le trigger ne décrément PAS sur DELETE → remise à zéro manuelle.
--    Les 20 clés de l'ancienne grille sont réinitialisées à 0.
-- ---------------------------------------------------------------------
update public.creneau_counts
   set n_dispo = 0
 where true;

-- ---------------------------------------------------------------------
-- 4. (Optionnel) Réinitialiser les RSVP si l'on repart aussi à zéro
--    côté confirmations de présence. À décommenter si souhaité.
-- ---------------------------------------------------------------------
-- delete from public.rsvp;
-- update public.rsvp_counters
--    set n_oui = 0, n_peut_etre = 0, total_presents = 0, updated_at = now()
--  where id = 1;

-- ---------------------------------------------------------------------
-- 5. Vérification finale (attendu : toutes les colonnes n_dispo = 0).
-- ---------------------------------------------------------------------
select creneau, n_dispo
from public.dispo_counts
order by creneau;
