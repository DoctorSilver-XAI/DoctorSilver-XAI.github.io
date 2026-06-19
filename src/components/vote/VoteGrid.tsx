import { useEffect, useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import { interpolate } from '@/i18n';
import { SITE, isRecommendedSlot, slotKey, type Role, type SlotKey } from '@/config/site';
import { formatDayFull, formatWeekday, formatDayDate, formatSlot } from '@/lib/datetime';
import { buildMailto, buildSummaryText, describeSlot, orderSlotKeys } from '@/lib/mailtoFallback';
import { hasSupabase } from '@/lib/supabaseClient';
import {
  fetchCreneauCounts,
  hasJurySubmitted,
  submitDisponibilite,
  subscribeCreneauCounts,
} from '@/lib/availability';
import { countsToMap } from '@/lib/voteAggregation';
import SlotCard from './SlotCard';

interface Props {
  lang: Lang;
  t: Dict['vote'];
}

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function VoteGrid({ lang, t }: Props) {
  const [name, setName] = useState('');
  // Par défaut : « Membre du jury » (cible première du recueil de disponibilités).
  const [role, setRole] = useState<Role>('jury');
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [counts, setCounts] = useState<Record<SlotKey, number>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [checking, setChecking] = useState(false);

  // Réinitialise le nom et l'état « déjà voté » quand on bascule de rôle
  // (le jury choisit dans une liste, l'invité saisit librement).
  function changeRole(next: Role) {
    setRole(next);
    setName('');
    setAlreadyVoted(false);
    if (status === 'success' || status === 'error') setStatus('idle');
  }

  // Lecture initiale des compteurs + abonnement temps réel (preuve sociale honnête).
  useEffect(() => {
    let active = true;
    fetchCreneauCounts()
      .then((rows) => {
        if (active) setCounts(countsToMap(rows));
      })
      .catch(() => {
        /* compteurs indisponibles : l'UI fonctionne sans (fallback mailto) */
      });
    const unsub = subscribeCreneauCounts((row) => {
      setCounts((prev) => ({ ...prev, [row.creneau]: row.n_dispo }));
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  // Garde-fou « déjà voté » : pour un membre du jury identifié, on demande à la DB
  // un simple booléen (RPC `jury_has_submitted`). Aucun nom n'est jamais lu côté client.
  useEffect(() => {
    if (role !== 'jury' || !name.trim()) {
      setAlreadyVoted(false);
      return;
    }
    let active = true;
    setChecking(true);
    hasJurySubmitted(name.trim())
      .then((v) => {
        if (active) setAlreadyVoted(v);
      })
      .catch(() => {
        if (active) setAlreadyVoted(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [name, role]);

  const orderedKeys = useMemo(() => orderSlotKeys([...selected]), [selected]);
  const ready = name.trim().length > 0 && selected.size > 0 && !alreadyVoted;
  const canSend = ready && status !== 'sending' && status !== 'success';

  function toggle(key: SlotKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (status === 'success' || status === 'error') setStatus('idle');
  }

  const payload = () => ({ name: name.trim(), role, slots: orderedKeys, lang });

  async function onSend() {
    if (!canSend) return;
    // Sans backend configuré : on bascule directement sur le mailto.
    if (!hasSupabase) {
      window.location.href = buildMailto(payload());
      return;
    }
    setStatus('sending');
    try {
      await submitDisponibilite({
        nom: name.trim(),
        role,
        creneaux: orderedKeys,
        commentaire: null,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  async function onCopy() {
    const text = buildSummaryText(payload());
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    window.setTimeout(() => setCopied(false), 1800);
  }

  const countLabel = interpolate(selected.size > 1 ? t.countMany : t.countOne, {
    n: selected.size,
  });

  return (
    <div className="instrument p-5 sm:p-8 md:p-10">
      {/* ÉTAPE 1 : Identité */}
      <div className="mb-9">
        <div className="mb-5 flex items-center gap-3">
          <span className="step-num">1</span>
          <h3 className="font-display text-xl text-ink-900">{t.step1}</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <div>
            <label htmlFor="visitor-name" className="mb-2 block text-sm font-medium text-ink-700">
              {t.nameLabel}
            </label>
            {role === 'jury' ? (
              <select
                id="visitor-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              >
                <option value="">{t.jurySelectPlaceholder}</option>
                {SITE.jury.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="visitor-name"
                type="text"
                className="field"
                autoComplete="name"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            {role === 'jury' && checking && (
              <p className="mt-2 text-xs text-ink-500">{t.checking}</p>
            )}
            {role === 'jury' && alreadyVoted && (
              <div
                className="mt-3 rounded-xl border border-teal-500/40 bg-teal-50 p-3 text-sm"
                role="status"
              >
                <p className="font-semibold text-teal-700">{t.alreadyVotedTitle}</p>
                <p className="mt-1 text-ink-700">{t.alreadyVotedBody}</p>
              </div>
            )}
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-ink-700">{t.roleLabel}</span>
            <div className="seg" role="radiogroup" aria-label={t.roleLabel}>
              <label className="seg__opt">
                <input
                  type="radio"
                  name="role"
                  checked={role === 'jury'}
                  onChange={() => changeRole('jury')}
                />
                <span>{t.roleJury}</span>
              </label>
              <label className="seg__opt">
                <input
                  type="radio"
                  name="role"
                  checked={role === 'invite'}
                  onChange={() => changeRole('invite')}
                />
                <span>{t.roleGuest}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ÉTAPE 2 : Créneaux */}
      <div className="mb-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="step-num">2</span>
            <h3 className="font-display text-xl text-ink-900">{t.step2}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            <span className="flex items-center gap-2">
              <span className="legend-dot border border-line bg-white" /> {t.legendFree}
            </span>
            <span className="flex items-center gap-2">
              <span className="legend-dot" style={{ background: 'linear-gradient(135deg,#2C56A0,#1E6F86)' }} />
              {t.legendSelected}
            </span>
            <span className="flex items-center gap-2">
              <span className="legend-dot" style={{ background: 'linear-gradient(135deg,#19A2B0,#34C5D3)' }} />
              {t.legendRecommended}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="legend-dot"
                style={{
                  background:
                    'repeating-linear-gradient(135deg,#F1F3F7,#F1F3F7 4px,#E2E6EE 4px,#E2E6EE 8px)',
                }}
              />
              {t.legendAvoid}
            </span>
          </div>
        </div>

        {SITE.windows.map((window) => (
          <section
            key={window.id}
            className={window.tier === 'fallback' ? 'mt-8 opacity-80' : 'mt-2'}
            aria-label={lang === 'fr' ? window.titleFr : window.titleEn}
          >
            <div className="mb-3">
              <h4
                className={`font-display text-lg ${
                  window.tier === 'fallback' ? 'text-ink-600' : 'text-ink-900'
                }`}
              >
                {lang === 'fr' ? window.titleFr : window.titleEn}
              </h4>
              <p className="mt-1 text-sm text-ink-500">
                {lang === 'fr' ? window.noteFr : window.noteEn}
              </p>
            </div>
            <div className="vote-grid">
              {window.days.map((day) => (
                <div className="day-col" key={day.id}>
                  <div className="day-head">
                    <div>
                      <div className="day-name">{formatWeekday(day, lang)}</div>
                      <div className="day-date">{formatDayDate(day, lang)}</div>
                    </div>
                    {day.avoid && <span className="day-flag">{t.avoidFlag}</span>}
                  </div>
                  <div className="day-slots">
                    {SITE.slots.map((slot) => {
                      const key = slotKey(day.id, slot.id);
                      const recommended = isRecommendedSlot(key);
                      const ariaLabel =
                        `${formatDayFull(day, lang)}, ${formatSlot(slot, lang)}` +
                        (recommended ? `, ${t.recoReason}` : '') +
                        (day.avoid ? `, ${t.avoidFlag}` : '');
                      return (
                        <SlotCard
                          key={key}
                          label={formatSlot(slot, lang)}
                          ariaLabel={ariaLabel}
                          selected={selected.has(key)}
                          recommended={recommended}
                          avoid={Boolean(day.avoid)}
                          count={counts[key] ?? 0}
                          t={t}
                          onToggle={() => toggle(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {hasSupabase && (
          <p className="mt-4 flex items-center gap-2 font-mono text-xs text-ink-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            {t.realtimeHint}
          </p>
        )}
      </div>

      {/* ÉTAPE 3 : Récapitulatif & envoi */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="step-num">3</span>
          <h3 className="font-display text-xl text-ink-900">{t.step3}</h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          {/* Récapitulatif live */}
          <div className="rounded-2xl border border-line bg-[#FBFDFF] p-5 sm:p-6 lg:col-span-3">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
              {t.summaryTitle}
            </p>
            <div className="text-[0.95rem] leading-relaxed text-ink-700" aria-live="polite">
              {selected.size === 0 ? (
                <p className="text-ink-500">{t.summaryEmpty}</p>
              ) : (
                <>
                  <p className="mb-3 font-mono text-xs text-teal-700">{countLabel}</p>
                  <p className="mb-1">
                    <span className="text-ink-500">{t.summaryRole} :</span>{' '}
                    <strong>{role === 'jury' ? t.roleJury : t.roleGuest}</strong>
                    {name.trim() && (
                      <>
                        {' · '}
                        <strong>{name.trim()}</strong>
                      </>
                    )}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {orderedKeys.map((key) => (
                      <li key={key} className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${
                            isRecommendedSlot(key) ? 'bg-teal-500' : 'bg-clinical-500'
                          }`}
                        />
                        <span>{describeSlot(key, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <button
              type="button"
              className="btn btn-primary w-full"
              aria-disabled={!canSend}
              onClick={onSend}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <path d="M4 5h16v14H4zM4 6l8 6 8-6" />
              </svg>
              {status === 'success' ? t.sentDb : status === 'sending' ? t.sending : t.send}
            </button>

            <button type="button" className="btn btn-ghost w-full" onClick={onCopy}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              {copied ? t.copied : t.copy}
            </button>

            {!ready && !alreadyVoted && (
              <p className="text-xs text-ink-500">{!name.trim() ? t.needName : t.needSlot}</p>
            )}

            {ready && status === 'idle' && (
              <div className="rounded-xl border border-clinical-400/35 bg-[#F7FAFF] p-4 text-sm">
                <p className="font-semibold text-clinical-700">{t.readyTitle}</p>
                <p className="mt-1 leading-relaxed text-ink-700">{t.readyBody}</p>
              </div>
            )}

            {status === 'success' && (
              <div
                className="rounded-2xl border border-teal-500/45 bg-teal-50 p-5 text-sm shadow-[0_20px_40px_-28px_rgba(25,162,176,.65)]"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-teal-500 text-white">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-display text-xl text-teal-700">{t.successTitle}</p>
                    <p className="mt-1 leading-relaxed text-ink-700">{t.successBody}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-teal-500/25 bg-white/70 p-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-teal-700">
                    {t.successSelection} · {countLabel}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-ink-700">
                    {orderedKeys.map((key) => (
                      <li key={key} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                        <span>{describeSlot(key, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 leading-relaxed text-ink-600">{t.successNext}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-xl border border-amber-400/50 bg-amber-50 p-4 text-sm" role="alert">
                <p className="font-semibold text-amber-700">{t.errorTitle}</p>
                <p className="mt-1 text-ink-700">{t.errorBody}</p>
                <a className="btn btn-ghost mt-3 w-full" href={buildMailto(payload())}>
                  {t.sendByEmail}
                </a>
              </div>
            )}

            <p className="mt-1 text-xs leading-relaxed text-ink-500">{t.privacy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
