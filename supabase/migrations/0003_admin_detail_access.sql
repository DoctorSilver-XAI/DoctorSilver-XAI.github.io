-- =====================================================================
-- Migration : admin_detail_access
-- Objectif : fournir au panneau admin léger les réponses nominatives.
-- Sécurité : accès volontairement simple par RPC avec mot de passe `thesis`.
--            Ce n'est pas une protection forte, mais cela évite d'exposer des
--            vues nominatives en SELECT direct au rôle anon.
-- =====================================================================

begin;

create or replace function public.admin_disponibilites(p_password text)
returns table (
  id uuid,
  nom text,
  role text,
  creneaux text[],
  commentaire text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    d.id,
    d.nom,
    d.role,
    d.creneaux,
    d.commentaire,
    d.created_at
  from public.disponibilites
  where p_password = 'thesis'
  order by created_at desc;
$$;

create or replace function public.admin_rsvp(p_password text)
returns table (
  id uuid,
  nom text,
  nb_accompagnants integer,
  presence text,
  creneau_prefere text,
  email text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    r.id,
    r.nom,
    r.nb_accompagnants,
    r.presence,
    r.creneau_prefere,
    r.email,
    r.created_at
  from public.rsvp
  where p_password = 'thesis'
  order by created_at desc;
$$;

grant execute on function public.admin_disponibilites(text) to anon, authenticated;
grant execute on function public.admin_rsvp(text) to anon, authenticated;

commit;
