-- =====================================================================
-- Seed : 3 disponibilités RÉELLES déjà confirmées sur mar7__s9 (idempotent).
--   Dr François Claron (jury) + 2 invités (parents de Pierre).
-- À exécuter via Studio / service_role (JAMAIS depuis le client web).
-- Les triggers incrémentent automatiquement creneau_counts ; les `id`
-- déterministes + `on conflict do nothing` garantissent l'idempotence
-- (pas de double comptage si on relance le seed).
-- =====================================================================

begin;

insert into public.disponibilites (id, nom, role, creneaux, commentaire, created_at)
values
  ('00000000-0000-0000-0000-000000000001',
   'Dr François Claron', 'jury',   array['mar7__s9'],
   'Confirmation membre du jury', '2026-06-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000002',
   'Parent de Pierre (1)', 'invite', array['mar7__s9'],
   null, '2026-06-01T09:05:00Z'),
  ('00000000-0000-0000-0000-000000000003',
   'Parent de Pierre (2)', 'invite', array['mar7__s9'],
   null, '2026-06-01T09:06:00Z')
on conflict (id) do nothing;

commit;

-- Vérification (lecture seule, attendu : mar7__s9 = 3) :
--   select * from public.dispo_counts where creneau = 'mar7__s9';
