import { useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import { useTranslations } from '@/i18n';
import { hasSupabase } from '@/lib/supabaseClient';
import {
  fetchAdminDisponibilites,
  fetchAdminRsvp,
  type AdminDisponibilite,
  type AdminRsvp,
} from '@/lib/availability';
import { fetchAdminModuleResponses, type AdminModuleResponse } from '@/lib/insights';
import { MODULES, moduleById, type Axis, type ModuleDef } from '@/config/modules';
import {
  distribution,
  familiarityAverages,
  histogram,
  type ModuleAnswerCount,
} from '@/lib/insightsAggregation';
import { describeSlot } from '@/lib/mailtoFallback';

interface Props {
  lang: Lang;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

const ADMIN_PASSWORD = 'thesis';

function formatSubmittedAt(value: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function roleLabel(role: AdminDisponibilite['role'], t: Dict): string {
  return role === 'jury' ? t.vote.roleJury : t.vote.roleGuest;
}

function presenceLabel(presence: AdminRsvp['presence'], t: Dict): string {
  return presence === 'oui' ? t.rsvp.presenceYes : t.rsvp.presenceMaybe;
}

/** Forme commune (superset) de la copy localisée d'un module. */
interface ModuleCopy {
  q: string;
  unit?: string;
  poleLeft?: string;
  poleRight?: string;
  options?: Record<string, string>;
  items?: Record<string, string>;
  categories?: Record<string, string>;
  reveal?: string;
}

/** Copy localisée d'un module (question/options/items/reveal). */
function moduleCopy(t: Dict, moduleId: string): ModuleCopy | undefined {
  return (t.insights.modules as Record<string, ModuleCopy>)[moduleId];
}

/** Titre lisible d'un module = sa question. */
function moduleTitle(t: Dict, moduleId: string): string {
  return (moduleCopy(t, moduleId)?.q as string) ?? moduleId;
}

/** Ordre canonique des axes pour la cartographie. */
const AXES: Axis[] = ['langage', 'diagnostic', 'suivi', 'explicabilite'];

/** Libellé lisible d'un axe via les clés i18n axisLangage, axisDiagnostic, etc. */
function axisLabel(axis: Axis, t: Dict): string {
  const map: Record<Axis, string> = {
    langage: t.insights.axisLangage,
    diagnostic: t.insights.axisDiagnostic,
    suivi: t.insights.axisSuivi,
    explicabilite: t.insights.axisExplicabilite,
  };
  return map[axis];
}

/** Libellé lisible d'un rôle de répondant (jury, proche, curieux, anonyme). */
function respondentRoleLabel(role: string | null, t: Dict): string {
  switch (role) {
    case 'jury':
      return t.insights.roleJury;
    case 'proche':
      return t.insights.roleProche;
    case 'curieux':
      return t.insights.roleCurieux;
    default:
      return t.insights.roleAnon;
  }
}

/** Libellé lisible d'une réponse nominative selon le type de module. */
function answerLabel(t: Dict, r: AdminModuleResponse): string {
  const copy = moduleCopy(t, r.module_id);
  const def = moduleById(r.module_id);
  if (!def) return r.answer_keys.join(', ');
  switch (def.type) {
    case 'estimation': {
      const v = r.answer_keys[0];
      const unit = copy?.unit ? ` ${copy.unit}` : '';
      return v != null ? `${v}${unit}` : t.admin.noValue;
    }
    case 'positioning': {
      const bucket = Number(r.answer_keys[0]);
      return Number.isNaN(bucket) ? t.admin.noValue : `${bucket * 10}%`;
    }
    case 'single':
      return r.answer_keys.map((k) => copy?.options?.[k] ?? k).join(', ');
    case 'familiarity':
      return r.answer_keys
        .map((k) => {
          const [item, level] = k.split(':');
          return `${copy?.items?.[item] ?? item} : ${level}`;
        })
        .join(' · ');
    case 'concept-map':
      return r.answer_keys
        .map((k) => {
          const [item, cat] = k.split(':');
          return `${copy?.items?.[item] ?? item} = ${copy?.categories?.[cat] ?? cat}`;
        })
        .join(' · ');
    default:
      return r.answer_keys.join(', ');
  }
}

/**
 * Convertit les réponses nominatives en compteurs agrégés locaux, pour réutiliser
 * `distribution`, `histogram`, `familiarityAverages` sur un sous-pool donné
 * (jury seul, ou l'ensemble), jamais le pool public temps réel.
 */
function countsFromResponses(responses: AdminModuleResponse[]): ModuleAnswerCount[] {
  const acc = new Map<string, ModuleAnswerCount>();
  for (const r of responses) {
    for (const key of r.answer_keys) {
      const id = `${r.module_id}::${key}`;
      const existing = acc.get(id);
      if (existing) existing.n += 1;
      else acc.set(id, { module_id: r.module_id, answer_key: key, n: 1 });
    }
  }
  return [...acc.values()];
}

export default function AdminPanel({ lang }: Props) {
  const t = useTranslations(lang);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [availability, setAvailability] = useState<AdminDisponibilite[]>([]);
  const [rsvp, setRsvp] = useState<AdminRsvp[]>([]);
  const [moduleResponses, setModuleResponses] = useState<AdminModuleResponse[]>([]);

  const totalSlots = useMemo(
    () => availability.reduce((sum, row) => sum + row.creneaux.length, 0),
    [availability],
  );
  const presentCount = useMemo(
    () =>
      rsvp
        .filter((row) => row.presence === 'oui')
        .reduce((sum, row) => sum + 1 + row.nb_accompagnants, 0),
    [rsvp],
  );

  // Réponses du jury, regroupées par membre (restitution nominative).
  const juryResponses = useMemo(
    () => moduleResponses.filter((r) => r.role === 'jury' && r.respondent),
    [moduleResponses],
  );
  const responsesByMember = useMemo(() => {
    const map = new Map<string, AdminModuleResponse[]>();
    for (const r of juryResponses) {
      const name = r.respondent ?? t.admin.noValue;
      const list = map.get(name);
      if (list) list.push(r);
      else map.set(name, [r]);
    }
    return [...map.entries()];
  }, [juryResponses, t.admin.noValue]);

  // Compteurs locaux (tous rôles confondus) pour la cartographie par axe.
  const allAggregates = useMemo(() => countsFromResponses(moduleResponses), [moduleResponses]);

  // Répartition des réponses par rôle de répondant (jury, proche, curieux, anonyme).
  const roleBreakdown = useMemo(() => {
    const counter = new Map<string, number>();
    for (const r of moduleResponses) {
      const key = r.role ?? 'anon';
      counter.set(key, (counter.get(key) ?? 0) + 1);
    }
    return ['jury', 'proche', 'curieux', 'anon']
      .map((role) => ({ role, n: counter.get(role) ?? 0 }))
      .filter((row) => row.n > 0);
  }, [moduleResponses]);

  async function loadResults(passwordForRequest = password) {
    if (!hasSupabase) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const [nextAvailability, nextRsvp, nextModuleResponses] = await Promise.all([
        fetchAdminDisponibilites(passwordForRequest),
        fetchAdminRsvp(passwordForRequest),
        fetchAdminModuleResponses(passwordForRequest),
      ]);
      setAvailability(nextAvailability);
      setRsvp(nextRsvp);
      setModuleResponses(nextModuleResponses);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    setUnlocked(true);
    void loadResults(password);
  }

  function close() {
    setOpen(false);
    setPasswordError(false);
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-night-900/10 bg-white/85 text-ink-500 shadow-soft backdrop-blur transition hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        aria-label={t.admin.open}
        title={t.admin.open}
        onClick={() => setOpen(true)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto bg-night-900/60 px-4 py-6 backdrop-blur-sm sm:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-title"
        >
          <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-white p-5 shadow-[0_30px_90px_-35px_rgba(7,11,20,.65)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-teal-600">
                  Admin
                </p>
                <h2 id="admin-title" className="font-display text-2xl text-ink-900 sm:text-3xl">
                  {t.admin.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                  {t.admin.lead}
                </p>
              </div>
              <button type="button" className="btn btn-ghost" onClick={close}>
                {t.admin.close}
              </button>
            </div>

            {!unlocked ? (
              <form onSubmit={unlock} className="mt-7 grid max-w-sm gap-3">
                <label htmlFor="admin-password" className="text-sm font-medium text-ink-700">
                  {t.admin.passwordLabel}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  className="field"
                  placeholder={t.admin.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-sm font-medium text-amber-700" role="alert">
                    {t.admin.wrongPassword}
                  </p>
                )}
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  {t.admin.unlock}
                </button>
              </form>
            ) : (
              <div className="mt-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded-xl border border-line bg-paper px-4 py-3">
                      <div className="font-mono text-xl text-ink-900">{availability.length}</div>
                      <div className="text-xs text-ink-500">{t.admin.availabilityTitle}</div>
                    </div>
                    <div className="rounded-xl border border-line bg-paper px-4 py-3">
                      <div className="font-mono text-xl text-ink-900">{totalSlots}</div>
                      <div className="text-xs text-ink-500">{t.admin.slots}</div>
                    </div>
                    <div className="rounded-xl border border-line bg-paper px-4 py-3">
                      <div className="font-mono text-xl text-ink-900">{presentCount}</div>
                      <div className="text-xs text-ink-500">{t.rsvp.counterLabel}</div>
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => void loadResults()}>
                    {status === 'loading' ? t.admin.loading : t.admin.refresh}
                  </button>
                </div>

                {!hasSupabase && (
                  <div className="rounded-xl border border-amber-400/50 bg-amber-50 p-4 text-sm text-ink-700">
                    {t.admin.unavailable}
                  </div>
                )}

                {status === 'error' && (
                  <div className="rounded-xl border border-amber-400/50 bg-amber-50 p-4 text-sm text-ink-700">
                    {t.admin.error}
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h3 className="mb-3 font-display text-xl text-ink-900">
                      {t.admin.availabilityTitle}
                    </h3>
                    <div className="space-y-3">
                      {availability.length === 0 ? (
                        <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-500">
                          {status === 'loading' ? t.admin.loading : t.admin.empty}
                        </p>
                      ) : (
                        availability.map((row) => (
                          <article key={row.id} className="rounded-xl border border-line bg-[#FBFDFF] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-semibold text-ink-900">{row.nom}</h4>
                                <p className="text-xs text-ink-500">
                                  {t.admin.role} : {roleLabel(row.role, t)}
                                </p>
                              </div>
                              <time className="font-mono text-[0.68rem] text-ink-400">
                                {formatSubmittedAt(row.created_at, lang)}
                              </time>
                            </div>
                            <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                              {row.creneaux.map((key) => (
                                <li key={key} className="flex gap-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                                  <span>{describeSlot(key, lang)}</span>
                                </li>
                              ))}
                            </ul>
                            {row.commentaire && (
                              <p className="mt-3 text-sm text-ink-500">
                                {t.admin.comment} : {row.commentaire}
                              </p>
                            )}
                          </article>
                        ))
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 font-display text-xl text-ink-900">{t.admin.rsvpTitle}</h3>
                    <div className="space-y-3">
                      {rsvp.length === 0 ? (
                        <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-500">
                          {status === 'loading' ? t.admin.loading : t.admin.empty}
                        </p>
                      ) : (
                        rsvp.map((row) => (
                          <article key={row.id} className="rounded-xl border border-line bg-[#FBFDFF] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-semibold text-ink-900">{row.nom}</h4>
                                <p className="text-xs text-ink-500">
                                  {t.admin.presence} : {presenceLabel(row.presence, t)}
                                </p>
                              </div>
                              <time className="font-mono text-[0.68rem] text-ink-400">
                                {formatSubmittedAt(row.created_at, lang)}
                              </time>
                            </div>
                            <dl className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                              <div>
                                <dt className="text-xs text-ink-400">{t.admin.companions}</dt>
                                <dd>{row.nb_accompagnants}</dd>
                              </div>
                              <div>
                                <dt className="text-xs text-ink-400">{t.admin.preferredSlot}</dt>
                                <dd>
                                  {row.creneau_prefere
                                    ? describeSlot(row.creneau_prefere, lang)
                                    : t.admin.noValue}
                                </dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-xs text-ink-400">{t.admin.email}</dt>
                                <dd>{row.email || t.admin.noValue}</dd>
                              </div>
                            </dl>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                {/* Cartographie de sensibilisation : par axe, plus détail jury. */}
                <section className="mt-8 border-t border-line pt-7">
                  <h3 className="mb-1 font-display text-xl text-ink-900">
                    {t.admin.cartographie}
                  </h3>
                  <p className="mb-4 text-sm text-ink-500">{t.admin.cartographieLead}</p>

                  {moduleResponses.length === 0 ? (
                    <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-500">
                      {status === 'loading' ? t.admin.loading : t.admin.noInsights}
                    </p>
                  ) : (
                    <div className="space-y-7">
                      {/* Répartition par rôle de répondant */}
                      <div>
                        <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-500">
                          {t.admin.byRole}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-sm">
                          {roleBreakdown.map((row) => (
                            <span
                              key={row.role}
                              className="rounded-xl border border-line bg-[#FBFDFF] px-4 py-2"
                            >
                              <span className="text-ink-700">
                                {respondentRoleLabel(row.role === 'anon' ? null : row.role, t)}
                              </span>
                              <span className="ml-2 font-mono text-xs text-ink-500">{row.n}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Cartographie par axe */}
                      <div>
                        <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-500">
                          {t.admin.byAxis}
                        </h4>
                        <div className="grid gap-4 lg:grid-cols-2">
                          {AXES.map((axis) => {
                            const axisModules = MODULES.filter(
                              (m) =>
                                m.axis === axis &&
                                moduleResponses.some((r) => r.module_id === m.id),
                            );
                            if (axisModules.length === 0) return null;
                            return (
                              <article
                                key={axis}
                                className="rounded-xl border border-line bg-[#FBFDFF] p-4"
                              >
                                <h5 className="font-display text-base text-ink-900">
                                  {axisLabel(axis, t)}
                                </h5>
                                <div className="mt-3 space-y-4">
                                  {axisModules.map((m: ModuleDef) => (
                                    <ModuleDistribution
                                      key={m.id}
                                      def={m}
                                      copy={moduleCopy(t, m.id)}
                                      counts={allAggregates}
                                      t={t}
                                    />
                                  ))}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>

                      {/* Détail nominatif jury */}
                      {responsesByMember.length > 0 && (
                        <div>
                          <h4 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-500">
                            {t.admin.juryDetail}
                          </h4>
                          <div className="grid gap-3 lg:grid-cols-2">
                            {responsesByMember.map(([member, rows]) => (
                              <article
                                key={member}
                                className="rounded-xl border border-line bg-[#FBFDFF] p-4"
                              >
                                <h5 className="font-semibold text-ink-900">{member}</h5>
                                <dl className="mt-3 space-y-2 text-sm">
                                  {rows.map((r) => (
                                    <div key={`${member}-${r.module_id}-${r.created_at}`}>
                                      <dt className="text-xs text-ink-400">
                                        {moduleTitle(t, r.module_id)}
                                      </dt>
                                      <dd className="text-ink-700">{answerLabel(t, r)}</dd>
                                    </div>
                                  ))}
                                </dl>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface ModuleDistributionProps {
  def: ModuleDef;
  copy: ModuleCopy | undefined;
  counts: ModuleAnswerCount[];
  t: Dict;
}

/**
 * Distribution d'un module pour la cartographie admin, selon son type :
 * estimation (histogramme sobre par tranches), positionnement (moyenne 0..100),
 * choix unique (répartition par option), familiarité (moyenne par notion),
 * concept-map (taux de bonne association au regard du mapping de référence).
 */
function ModuleDistribution({ def, copy, counts, t }: ModuleDistributionProps) {
  const title = (copy?.q as string) ?? def.id;

  if (def.type === 'estimation' && def.estimation) {
    const cfg = def.estimation;
    const span = cfg.max - cfg.min;
    const binSize = Math.max(cfg.step, Math.round(span / 10) || cfg.step);
    const bins = histogram(counts, def.id, { min: cfg.min, max: cfg.max, binSize });
    const maxN = bins.reduce((m, b) => Math.max(m, b.n), 0) || 1;
    const unit = copy?.unit ? ` ${copy.unit}` : '';
    return (
      <div>
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <p className="mt-1 font-mono text-[0.7rem] text-ink-400">
          {t.insights.evidence} : {cfg.reference}
          {unit}
        </p>
        <ul className="mt-2 space-y-1">
          {bins.map((b) => (
            <li key={b.start} className="flex items-center gap-2 text-xs text-ink-600">
              <span className="w-16 flex-none font-mono text-ink-500">
                {b.start}
                {'–'}
                {b.end}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-clinical-500 to-clinical-400"
                  style={{ width: `${Math.round((b.n / maxN) * 100)}%` }}
                />
              </span>
              <span className="w-6 flex-none text-right font-mono text-ink-500">{b.n}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (def.type === 'positioning') {
    const rows = counts.filter((c) => c.module_id === def.id);
    let weighted = 0;
    let total = 0;
    for (const r of rows) {
      const v = Number(r.answer_key);
      if (!Number.isNaN(v)) {
        weighted += v * r.n;
        total += r.n;
      }
    }
    const avgPct = total > 0 ? Math.round((weighted / total) * 10) : null;
    return (
      <div>
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <div className="mt-2 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-ink-400">
          <span>{copy?.poleLeft ?? ''}</span>
          <span>{copy?.poleRight ?? ''}</span>
        </div>
        <div className="relative mt-1 h-2 w-full rounded-full bg-line">
          {avgPct != null && (
            <span
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-500 shadow"
              style={{ left: `${avgPct}%` }}
            />
          )}
        </div>
        <p className="mt-1 font-mono text-[0.7rem] text-ink-500">
          {avgPct != null ? `${avgPct}%` : t.admin.noValue}
        </p>
      </div>
    );
  }

  if (def.type === 'single' && def.options) {
    const shares = distribution(
      counts,
      def.id,
      def.options.map((o) => o.key),
    );
    return (
      <div>
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
          {shares.map((s) => (
            <li key={s.key} className="flex justify-between gap-3">
              <span>{copy?.options?.[s.key] ?? s.key}</span>
              <span className="font-mono text-xs text-ink-500">
                {s.n} · {s.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (def.type === 'familiarity' && def.familiarity) {
    const items = def.familiarity.items.map((it) => it.key);
    const averages = familiarityAverages(counts, def.id, items);
    return (
      <div>
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
          {items.map((item) => {
            const avg = averages[item];
            return (
              <li key={item} className="flex justify-between gap-3">
                <span>{copy?.items?.[item] ?? item}</span>
                <span className="font-mono text-xs text-ink-500">
                  {avg != null
                    ? `${avg.toFixed(1)}/${def.familiarity?.scale ?? 5}`
                    : t.admin.noValue}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (def.type === 'concept-map' && def.conceptMap) {
    const mapping = def.conceptMap.mapping;
    const rows = counts.filter((c) => c.module_id === def.id);
    let correct = 0;
    let total = 0;
    for (const r of rows) {
      const [item, cat] = r.answer_key.split(':');
      if (!item || !cat) continue;
      total += r.n;
      if (mapping[item] === cat) correct += r.n;
    }
    const pct = total > 0 ? Math.round((100 * correct) / total) : null;
    return (
      <div>
        <p className="text-sm font-medium text-ink-700">{title}</p>
        <p className="mt-2 font-mono text-xs text-ink-500">
          {t.admin.conceptAccuracy} : {pct != null ? `${pct}%` : t.admin.noValue}
        </p>
      </div>
    );
  }

  return null;
}
