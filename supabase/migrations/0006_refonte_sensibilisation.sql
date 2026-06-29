-- =====================================================================
-- Migration, refonte sensibilisation. Postgres 15 plus, idempotente.
-- Met a jour la liste des modules, ajoute le role optionnel, purge
-- les donnees de l ancien jeu de modules.
-- =====================================================================
begin;

create or replace function app_private.valid_module_ids()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'situer-ia','familiarite','delai-diagnostic','diagnostic-differentiel',
    'intensification','role-pharmacien','performance-fiabilite','boite-noire'
  ];
$$;

-- Role optionnel du repondant. jury, proche, curieux, ou null (anonyme).
alter table public.module_responses
  add column if not exists role text;

alter table public.module_responses
  drop constraint if exists module_responses_role_chk;
alter table public.module_responses
  add constraint module_responses_role_chk
  check (role is null or role in ('jury','proche','curieux'));

-- Le nom n existe que pour le role jury.
alter table public.module_responses
  drop constraint if exists module_responses_respondent_chk;
alter table public.module_responses
  add constraint module_responses_respondent_chk
  check (respondent is null or (role = 'jury' and char_length(respondent) between 1 and 120));

-- Purge des donnees de l ancien jeu de modules (identifiants disparus).
delete from public.module_responses
  where module_id <> all (app_private.valid_module_ids());
delete from public.module_answer_counts
  where module_id <> all (app_private.valid_module_ids());

-- Politique d insertion anon mise a jour (role pris en compte).
drop policy if exists "anon_insert_module_responses" on public.module_responses;
create policy "anon_insert_module_responses"
  on public.module_responses
  for insert
  to anon
  with check (
    module_id = any (app_private.valid_module_ids())
    and context in ('public','jury')
    and (role is null or role in ('jury','proche','curieux'))
    and (respondent is null or (role = 'jury' and char_length(respondent) between 1 and 120))
    and cardinality(answer_keys) between 0 and 20
    and (answer_text is null or char_length(answer_text) <= 1000)
  );

-- RPC admin, lecture nominative jury, ajout du role.
-- DROP prealable obligatoire : la signature de retour change (colonne role ajoutee),
-- et create or replace ne peut pas modifier le type de retour d une fonction existante.
drop function if exists public.admin_module_responses(text);
create function public.admin_module_responses(p_password text)
returns table (
  respondent  text,
  role        text,
  module_id   text,
  answer_keys text[],
  answer_text text,
  created_at  timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select respondent, role, module_id, answer_keys, answer_text, created_at
  from public.module_responses
  where p_password = 'thesis'
  order by created_at;
$$;
grant execute on function public.admin_module_responses(text) to anon, authenticated;

commit;
