-- =====================================================================
-- Migration : jury_submission_check
-- Objet : permettre au front de savoir si un MEMBRE DU JURY a déjà transmis
--         ses disponibilités, SANS jamais exposer la moindre PII.
--
-- Rappel du modèle de sécurité (cf. 0001) : anon peut INSÉRER dans
-- public.disponibilites mais n'a AUCUN droit de SELECT (RLS = zéro fuite de noms).
-- Le front ne peut donc pas lire la table pour vérifier une présence.
--
-- Solution : une fonction SECURITY DEFINER qui ne renvoie qu'un BOOLÉEN pour un
-- nom donné. Elle ne projette aucune ligne, aucun nom, aucun e-mail. Le membre
-- du jury connaît déjà son propre nom (il le choisit dans la liste) ; la fonction
-- se borne à confirmer « ce nom a-t-il déjà répondu ? ». Idempotente.
-- =====================================================================

begin;

create or replace function public.jury_has_submitted(p_nom text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.disponibilites
    where role = 'jury'
      and nom = p_nom
  );
$$;

comment on function public.jury_has_submitted(text) is
  'Renvoie TRUE si un membre du jury portant ce nom a déjà transmis ses disponibilités. '
  'SECURITY DEFINER : contourne la RLS pour LIRE, mais ne renvoie qu''un booléen (aucune PII).';

-- Exécution réservée au rôle anon (clé publishable du navigateur).
revoke all on function public.jury_has_submitted(text) from public;
grant execute on function public.jury_has_submitted(text) to anon;

commit;

-- Vérification (attendu : true, car le seed contient « Dr François Claron ») :
--   select public.jury_has_submitted('Dr François Claron');
