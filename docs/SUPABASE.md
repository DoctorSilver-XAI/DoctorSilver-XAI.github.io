# Backend Supabase — mise en place (≈ 2 min)

Le site **fonctionne sans Supabase** (le module de vote et le RSVP basculent automatiquement
sur un e-mail pré-rempli + « Copier le résumé »). Mais pour activer **l'enregistrement des
réponses + la preuve sociale et les compteurs en temps réel**, applique la migration ci-dessous.

> ⚠️ **Sécurité d'abord.** La _secret key_ (`sb_secret_…`) et le mot de passe de la base ont
> figuré en clair dans un fichier de travail. **Régénère-les** dans le dashboard Supabase
> (_Settings → API_ et _Settings → Database_) par précaution. Le site n'utilise QUE la clé
> _publishable_ (anon), qui est conçue pour le navigateur et fonctionne avec la RLS.

## 1. Appliquer le schéma

Dashboard Supabase → projet **Thesis** (`qlpvnmhqjapnktrjwppy`) → **SQL Editor** → _New query_ →
colle l'intégralité de [`supabase/migrations/0001_thesis_defense_schema.sql`](../supabase/migrations/0001_thesis_defense_schema.sql)
→ **Run**.

Crée : les tables `disponibilites` et `rsvp` (PII verrouillée par RLS), les tables de compteurs
`creneau_counts` / `rsvp_counters`, les triggers d'agrégation, les vues publiques `dispo_counts`
/ `rsvp_summary` (agrégats sans nom), et l'ajout des compteurs à la publication Realtime.

## 2. Amorcer les confirmations réelles

Toujours dans le SQL Editor, colle [`supabase/seed.sql`](../supabase/seed.sql) → **Run**.
Insère les 3 disponibilités réelles sur **mardi 7 juillet 9 h–11 h** (Dr Claron + 2 invités).
Idempotent : ré-exécutable sans double comptage.

## 3. (Optionnel) Ajuster la capacité de salle

```sql
update public.rsvp_counters set capacite_salle = 60 where id = 1; -- mets ta vraie capacité
```

## 4. Variables d'environnement du site

`.env` à la racine (déjà présent en local, à recréer sur l'hébergeur) :

```
PUBLIC_SUPABASE_URL=https://qlpvnmhqjapnktrjwppy.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…   # ta clé publishable (anon), jamais la secrète
```

## 5. Vérifier

```sql
-- Attendu : mar7__s9 = 3, le reste à 0
select * from public.dispo_counts order by n_dispo desc, creneau;
-- Avec la clé anon (REST), ceci doit ÉCHOUER (aucune fuite de noms) :
--   select * from public.disponibilites;   -> 0 ligne / permission denied
```

Puis lance le site (`pnpm dev`), coche un créneau, envoie : le compteur du créneau doit
s'incrémenter **en direct** (et sur un second onglet ouvert en parallèle).

## Consultation privée (réservée à Pierre)

Le détail nominatif n'est **jamais** exposé au client. Pour voir qui a répondu / la convergence
nominative, utilise le **Table Editor** ou le SQL Editor (rôle `service_role`, bypass RLS) :

```sql
select created_at, nom, role, creneaux, commentaire from public.disponibilites order by created_at;
select unnest(creneaux) as creneau, nom, role from public.disponibilites order by 1, 3;
```

## Note advisors (faux positif attendu)

Après application, _Advisors → Security_ signalera `security_definer_view` sur `dispo_counts`
et `rsvp_summary`. **C'est voulu** : ces vues bypassent la RLS pour ne renvoyer que des
compteurs (aucune PII). Ne **pas** les passer en `security_invoker = true` (elles renverraient
alors 0 ligne à anon). Toutes les tables ont la RLS activée.

## Si tu veux que je l'applique à ta place

Le serveur MCP Supabase connecté ici n'a pas accès au projet `qlpvnmhqjapnktrjwppy` (il ne voit
qu'un projet d'une autre organisation). Pour que je puisse appliquer/auditer directement,
rattache ce projet au compte MCP (ou fournis un accès dédié) — sinon les étapes Studio ci-dessus
suffisent amplement.
