-- =====================================================================
-- Seed : NEUTRALISÉ — décision de cadrage 2026-06-19.
--
-- Contexte : la collecte de disponibilités repart à zéro sur les nouvelles
-- dates (semaine du 20-24 juillet 2026, repli 17-21 août 2026), SANS
-- preuve sociale. Les anciens créneaux mar7__s9 (et toute la semaine
-- lun6__*/mar7__*/mer8__*/jeu9__*/ven10__*) sont abandonnés.
--
-- Ce fichier ne seed RIEN. Le re-jouer est sans effet sur la base.
--
-- Si une confirmation RÉELLE doit être pré-enregistrée à l'avenir,
-- l'ajouter DÉLIBÉRÉMENT ici sur un créneau courant (ex. lun20__s9),
-- avec les UUID et la date réels — jamais ré-insérer automatiquement
-- des entrées fictives ou obsolètes.
--
-- À exécuter via Studio / service_role (JAMAIS depuis le client web).
-- =====================================================================

begin;

-- (aucune insertion — corpus vide par décision 2026-06-19)

commit;

-- Vérification (lecture seule, attendu : toutes les lignes n_dispo = 0) :
--   select * from public.dispo_counts order by creneau;
