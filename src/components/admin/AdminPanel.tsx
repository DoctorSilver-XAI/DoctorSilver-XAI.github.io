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

export default function AdminPanel({ lang }: Props) {
  const t = useTranslations(lang);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [availability, setAvailability] = useState<AdminDisponibilite[]>([]);
  const [rsvp, setRsvp] = useState<AdminRsvp[]>([]);

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

  async function loadResults(passwordForRequest = password) {
    if (!hasSupabase) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    try {
      const [nextAvailability, nextRsvp] = await Promise.all([
        fetchAdminDisponibilites(passwordForRequest),
        fetchAdminRsvp(passwordForRequest),
      ]);
      setAvailability(nextAvailability);
      setRsvp(nextRsvp);
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
