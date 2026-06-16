import { useEffect, useState } from 'react';
import type { Dict } from '@/i18n';
import { interpolate } from '@/i18n';
import { SITE } from '@/config/site';
import { fetchRsvpSummary, subscribeRsvpSummary, type RsvpSummary } from '@/lib/availability';

interface Props {
  t: Dict['rsvp'];
}

export default function AttendanceCounter({ t }: Props) {
  const [summary, setSummary] = useState<RsvpSummary | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchRsvpSummary()
        .then((s) => {
          if (active) setSummary(s);
        })
        .catch(() => {});
    load();
    const unsub = subscribeRsvpSummary(() => load());
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const total = summary?.total_presents ?? 0;
  const cap = summary?.capacite_salle ?? SITE.venue.capacity;
  const left = summary?.places_restantes ?? Math.max(cap - total, 0);
  const pct = cap > 0 ? Math.min(100, Math.round((total / cap) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-4xl text-ink-900" aria-live="polite">
            {total}
          </div>
          <div className="text-sm text-ink-500">{t.counterLabel}</div>
        </div>
        <div className="text-right text-xs text-ink-500">
          <div>
            {t.capacityLabel} : {cap}
          </div>
          <div>{interpolate(t.placesLeft, { n: left })}</div>
        </div>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-label={t.capacityLabel}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-teal-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {summary && summary.n_peut_etre > 0 && (
        <p className="mt-3 font-mono text-xs text-ink-500">
          +{summary.n_peut_etre} {t.maybeLabel}
        </p>
      )}
    </div>
  );
}
