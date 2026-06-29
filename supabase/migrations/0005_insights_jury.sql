-- =====================================================================
-- Migration : insights_jury
-- Cible : Postgres 15+ (Supabase). Idempotente.
-- Sécurité : RLS verrouille tout ; anon INSÈRE mais ne LIT que les
--            compteurs agrégés (jamais de réponse nominative).
-- =====================================================================
begin;

-- 0. Référentiel des IDs de modules (source de vérité des CHECK).
create schema if not exists app_private;

create or replace function app_private.valid_module_ids()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'interet-global','familiarite-ia','pepite-arn','promesse-bipolaire',
    'pepite-polypharmacie','xai-verrou','pepite-auc','opinion-aug-sub',
    'enjeux-humain','pharmacien-pivot','attente-vision'
  ];
$$;

-- 1. TABLE module_responses (une ligne par répondant × module).
create table if not exists public.module_responses (
  id          uuid primary key default gen_random_uuid(),
  module_id   text        not null,
  context     text        not null,
  respondent  text,
  answer_keys text[]      not null default '{}',
  answer_text text,
  created_at  timestamptz not null default now(),

  constraint module_responses_module_chk
    check (module_id = any (app_private.valid_module_ids())),
  constraint module_responses_context_chk
    check (context in ('public','jury')),
  constraint module_responses_respondent_chk
    check (respondent is null or (context = 'jury' and char_length(respondent) between 1 and 120)),
  constraint module_responses_keys_card_chk
    check (cardinality(answer_keys) between 0 and 20),
  constraint module_responses_text_len_chk
    check (answer_text is null or char_length(answer_text) <= 1000)
);

comment on table public.module_responses is
  'Réponses aux modules insights. respondent (PII) JAMAIS lisible par anon (RLS).';

-- 2. TABLE de compteurs agrégés (pool PUBLIC uniquement). Aucune PII.
--    PK (module_id, answer_key) ; lignes créées à la volée (clés dynamiques :
--    options, buckets de curseurs 'item:bucket'...). Pas de pré-seed.
create table if not exists public.module_answer_counts (
  module_id  text    not null,
  answer_key text    not null,
  n          integer not null default 0,
  primary key (module_id, answer_key),
  constraint module_answer_counts_module_chk
    check (module_id = any (app_private.valid_module_ids())),
  constraint module_answer_counts_n_chk check (n >= 0)
);

-- 3. TRIGGER d'agrégation : seules les réponses 'public' alimentent les compteurs
--    => les agrégats montrés ne révèlent jamais les membres du jury entre eux.
create or replace function app_private.bump_module_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare k text;
begin
  if new.context = 'public' then
    foreach k in array coalesce(new.answer_keys, '{}') loop
      insert into public.module_answer_counts (module_id, answer_key, n)
      values (new.module_id, k, 1)
      on conflict (module_id, answer_key)
      do update set n = public.module_answer_counts.n + 1;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_module_counts on public.module_responses;
create trigger trg_bump_module_counts
  after insert on public.module_responses
  for each row execute function app_private.bump_module_counts();

-- 4. RLS.
alter table public.module_responses    enable row level security;
alter table public.module_answer_counts enable row level security;

revoke all on public.module_responses     from anon, authenticated;
revoke all on public.module_answer_counts from anon, authenticated;

grant insert on public.module_responses      to anon;
grant select on public.module_answer_counts  to anon;

drop policy if exists "anon_insert_module_responses" on public.module_responses;
create policy "anon_insert_module_responses"
  on public.module_responses
  for insert
  to anon
  with check (
    module_id = any (app_private.valid_module_ids())
    and context in ('public','jury')
    and (respondent is null or (context = 'jury' and char_length(respondent) between 1 and 120))
    and cardinality(answer_keys) between 0 and 20
    and (answer_text is null or char_length(answer_text) <= 1000)
  );
-- AUCUNE policy SELECT/UPDATE/DELETE anon sur module_responses => PII verrouillée.

drop policy if exists "anon_select_module_answer_counts" on public.module_answer_counts;
create policy "anon_select_module_answer_counts"
  on public.module_answer_counts for select to anon using (true);

-- 5. RPC anti-double-réponse (booléen, zéro PII).
create or replace function public.jury_answered_module(p_nom text, p_module_id text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.module_responses
    where context = 'jury' and respondent = p_nom and module_id = p_module_id
  );
$$;
grant execute on function public.jury_answered_module(text, text) to anon;

-- 6. RPC admin (lecture nominative jury, protégée par mot de passe partagé).
create or replace function public.admin_module_responses(p_password text)
returns table (
  respondent  text,
  module_id   text,
  answer_keys text[],
  answer_text text,
  created_at  timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select respondent, module_id, answer_keys, answer_text, created_at
  from public.module_responses
  where context = 'jury' and p_password = 'thesis'
  order by created_at;
$$;
grant execute on function public.admin_module_responses(text) to anon, authenticated;

-- 7. Realtime : publier la SEULE table de compteurs.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'module_answer_counts'
  ) then
    execute 'alter publication supabase_realtime add table public.module_answer_counts';
  end if;
end $$;

commit;
