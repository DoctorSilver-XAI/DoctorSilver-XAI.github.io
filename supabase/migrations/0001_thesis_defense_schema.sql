-- =====================================================================
-- Migration : thesis_defense_schema
-- Cible : Postgres 15+ (compatible PG17 Supabase). Idempotente.
-- Sécurité : RLS verrouille tout ; le rôle anon ne LIT que des agrégats
--            (aucun nom, aucun e-mail exposé via la clé publishable).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Référentiel des clés de créneaux (source de vérité des CHECK).
--    jours : lun6/mar7/mer8/jeu9/ven10 (juillet 2026)
--    slots : s9/s11/s14/s16  -> 5 x 4 = 20 clés "jour__slot"
-- ---------------------------------------------------------------------
create schema if not exists app_private; -- jamais exposé à l'API

create or replace function app_private.valid_slot_keys()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array(
    select d || '__' || s
    from unnest(array['lun6','mar7','mer8','jeu9','ven10']) as d
    cross join unnest(array['s9','s11','s14','s16']) as s
  );
$$;

-- ---------------------------------------------------------------------
-- 1. TABLE disponibilites (jury + invités : créneaux cochés)
-- ---------------------------------------------------------------------
create table if not exists public.disponibilites (
  id          uuid primary key default gen_random_uuid(),
  nom         text        not null,
  role        text        not null,
  creneaux    text[]      not null default '{}',
  commentaire text,
  created_at  timestamptz not null default now(),

  constraint disponibilites_nom_len_chk
    check (char_length(nom) between 1 and 120),
  constraint disponibilites_role_chk
    check (role in ('jury','invite')),
  constraint disponibilites_commentaire_len_chk
    check (commentaire is null or char_length(commentaire) <= 1000),
  constraint disponibilites_creneaux_card_chk
    check (cardinality(creneaux) between 0 and 20),
  constraint disponibilites_creneaux_valid_chk
    check (creneaux <@ app_private.valid_slot_keys())
);

comment on table public.disponibilites is
  'Disponibilités jury/invités. PII (nom/commentaire) JAMAIS lisible par anon (RLS).';

-- ---------------------------------------------------------------------
-- 2. TABLE rsvp (présence invités)
-- ---------------------------------------------------------------------
create table if not exists public.rsvp (
  id               uuid primary key default gen_random_uuid(),
  nom              text        not null,
  nb_accompagnants integer     not null default 0,
  presence         text        not null,
  creneau_prefere  text,
  email            text,
  created_at       timestamptz not null default now(),

  constraint rsvp_nom_len_chk
    check (char_length(nom) between 1 and 120),
  constraint rsvp_accompagnants_chk
    check (nb_accompagnants between 0 and 20),
  constraint rsvp_presence_chk
    check (presence in ('oui','peut_etre')),
  constraint rsvp_creneau_prefere_chk
    check (creneau_prefere is null
           or creneau_prefere = any (app_private.valid_slot_keys())),
  constraint rsvp_email_len_chk
    check (email is null or char_length(email) <= 254),
  constraint rsvp_email_format_chk
    check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

comment on table public.rsvp is
  'RSVP invités. email/nom = PII, JAMAIS lisible par anon (RLS).';

-- ---------------------------------------------------------------------
-- 3. TABLES DE COMPTEURS (lecture agrégée + Realtime). Aucune PII.
-- ---------------------------------------------------------------------
create table if not exists public.creneau_counts (
  creneau text primary key,
  n_dispo integer not null default 0,
  constraint creneau_counts_key_chk
    check (creneau = any (app_private.valid_slot_keys())),
  constraint creneau_counts_n_chk
    check (n_dispo >= 0)
);

create table if not exists public.rsvp_counters (
  id              integer primary key default 1,
  n_oui           integer not null default 0,
  n_peut_etre     integer not null default 0,
  total_presents  integer not null default 0,  -- somme(1+accompagnants) pour 'oui'
  capacite_salle  integer not null default 60, -- ajuster à la capacité réelle
  updated_at      timestamptz not null default now(),
  constraint rsvp_counters_singleton_chk check (id = 1),
  constraint rsvp_counters_nonneg_chk
    check (n_oui >= 0 and n_peut_etre >= 0 and total_presents >= 0 and capacite_salle >= 0)
);

-- Initialisation idempotente des 20 lignes de créneaux à 0.
insert into public.creneau_counts (creneau, n_dispo)
select k, 0 from unnest(app_private.valid_slot_keys()) as k
on conflict (creneau) do nothing;

-- Ligne unique de compteurs RSVP.
insert into public.rsvp_counters (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 4. TRIGGERS de maintenance des compteurs (SECURITY DEFINER).
-- ---------------------------------------------------------------------
create or replace function app_private.bump_creneau_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare k text;
begin
  foreach k in array coalesce(new.creneaux, '{}') loop
    update public.creneau_counts
       set n_dispo = n_dispo + 1
     where creneau = k;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_bump_creneau_counts on public.disponibilites;
create trigger trg_bump_creneau_counts
  after insert on public.disponibilites
  for each row execute function app_private.bump_creneau_counts();

create or replace function app_private.bump_rsvp_counters()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.presence = 'oui' then
    update public.rsvp_counters
       set n_oui          = n_oui + 1,
           total_presents = total_presents + 1 + coalesce(new.nb_accompagnants, 0),
           updated_at     = now()
     where id = 1;
  elsif new.presence = 'peut_etre' then
    update public.rsvp_counters
       set n_peut_etre = n_peut_etre + 1,
           updated_at   = now()
     where id = 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bump_rsvp_counters on public.rsvp;
create trigger trg_bump_rsvp_counters
  after insert on public.rsvp
  for each row execute function app_private.bump_rsvp_counters();

-- ---------------------------------------------------------------------
-- 5. RLS : activer partout, verrouiller, ouvrir le strict minimum.
-- ---------------------------------------------------------------------
alter table public.disponibilites enable row level security;
alter table public.rsvp           enable row level security;
alter table public.creneau_counts enable row level security;
alter table public.rsvp_counters  enable row level security;

revoke all on public.disponibilites from anon, authenticated;
revoke all on public.rsvp           from anon, authenticated;
revoke all on public.creneau_counts from anon, authenticated;
revoke all on public.rsvp_counters  from anon, authenticated;

grant insert on public.disponibilites to anon;
grant insert on public.rsvp           to anon;
grant select on public.creneau_counts to anon;
grant select on public.rsvp_counters  to anon;

-- 5a. INSERT anon disponibilites : WITH CHECK = défense en profondeur.
drop policy if exists "anon_insert_disponibilites" on public.disponibilites;
create policy "anon_insert_disponibilites"
  on public.disponibilites
  for insert
  to anon
  with check (
    role in ('jury','invite')
    and char_length(nom) between 1 and 120
    and (commentaire is null or char_length(commentaire) <= 1000)
    and cardinality(creneaux) between 0 and 20
    and creneaux <@ app_private.valid_slot_keys()
  );

-- 5b. INSERT anon rsvp.
drop policy if exists "anon_insert_rsvp" on public.rsvp;
create policy "anon_insert_rsvp"
  on public.rsvp
  for insert
  to anon
  with check (
    presence in ('oui','peut_etre')
    and nb_accompagnants between 0 and 20
    and char_length(nom) between 1 and 120
    and (creneau_prefere is null
         or creneau_prefere = any (app_private.valid_slot_keys()))
    and (email is null or char_length(email) <= 254)
  );

-- 5c. AUCUNE policy SELECT/UPDATE/DELETE anon sur les tables de base
--     => RLS active + pas de policy permissive = tout refusé. Zéro fuite PII.

-- 5d. Compteurs : SELECT public (agrégats sans nom). Pas d'écriture anon.
drop policy if exists "anon_select_creneau_counts" on public.creneau_counts;
create policy "anon_select_creneau_counts"
  on public.creneau_counts for select to anon using (true);

drop policy if exists "anon_select_rsvp_counters" on public.rsvp_counters;
create policy "anon_select_rsvp_counters"
  on public.rsvp_counters for select to anon using (true);

-- ---------------------------------------------------------------------
-- 6. VUES D'AGRÉGAT (lecture HTTP/SSR pratique).
--    Créées SANS security_invoker => SECURITY DEFINER par défaut (PG15+) :
--    elles bypassent la RLS des tables de base MAIS ne projettent que des
--    comptes -> aucune PII exposée. NE PAS mettre security_invoker = true
--    (sinon la vue respecterait la RLS et renverrait 0 ligne à anon).
-- ---------------------------------------------------------------------
create or replace view public.dispo_counts as
  select creneau, n_dispo
  from public.creneau_counts
  order by creneau;

create or replace view public.rsvp_summary as
  select
    n_oui,
    n_peut_etre,
    total_presents,
    capacite_salle,
    greatest(capacite_salle - total_presents, 0) as places_restantes,
    case when capacite_salle > 0
         then round(100.0 * total_presents / capacite_salle, 1)
         else 0 end as taux_occupation_pct
  from public.rsvp_counters
  where id = 1;

grant select on public.dispo_counts to anon, authenticated;
grant select on public.rsvp_summary to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. REALTIME : publier les TABLES DE COMPTEURS (pas les vues, pas les
--    tables de base). anon a SELECT dessus => reçoit les payloads agrégés.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'creneau_counts'
  ) then
    execute 'alter publication supabase_realtime add table public.creneau_counts';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'rsvp_counters'
  ) then
    execute 'alter publication supabase_realtime add table public.rsvp_counters';
  end if;
end $$;

commit;
