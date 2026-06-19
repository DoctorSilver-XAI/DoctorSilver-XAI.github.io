import { useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import { SITE, allDays, slotKey, type Presence } from '@/config/site';
import { formatDayFull, formatSlot } from '@/lib/datetime';
import { submitRsvp } from '@/lib/availability';

interface Props {
  lang: Lang;
  t: Dict['rsvp'];
}

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function RsvpForm({ lang, t }: Props) {
  const [name, setName] = useState('');
  const [companions, setCompanions] = useState(0);
  const [presence, setPresence] = useState<Presence>('oui');
  const [pref, setPref] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const ready = name.trim().length > 0;

  const slotOptions = useMemo(
    () =>
      allDays().flatMap((d) =>
        SITE.slots.map((s) => ({
          key: slotKey(d.id, s.id),
          label: `${formatDayFull(d, lang)} · ${formatSlot(s, lang)}`,
        })),
      ),
    [lang],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || status === 'sending') return;
    setStatus('sending');
    try {
      await submitRsvp({
        nom: name.trim(),
        nb_accompagnants: companions,
        presence,
        creneau_prefere: pref || null,
        email: email.trim() || null,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-teal-500/40 bg-teal-50 p-6" role="status">
        <p className="font-display text-xl text-teal-700">{t.successTitle}</p>
        <p className="mt-2 text-ink-700">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-card p-5 shadow-soft sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="rsvp-name" className="mb-2 block text-sm font-medium text-ink-700">
            {t.nameLabel}
          </label>
          <input
            id="rsvp-name"
            type="text"
            className="field"
            autoComplete="name"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink-700">{t.presenceLabel}</span>
          <div className="seg" role="radiogroup" aria-label={t.presenceLabel}>
            <label className="seg__opt">
              <input type="radio" name="presence" checked={presence === 'oui'} onChange={() => setPresence('oui')} />
              <span>{t.presenceYes}</span>
            </label>
            <label className="seg__opt">
              <input
                type="radio"
                name="presence"
                checked={presence === 'peut_etre'}
                onChange={() => setPresence('peut_etre')}
              />
              <span>{t.presenceMaybe}</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="rsvp-companions" className="mb-2 block text-sm font-medium text-ink-700">
            {t.companionsLabel}
          </label>
          <input
            id="rsvp-companions"
            type="number"
            min={0}
            max={20}
            className="field"
            value={companions}
            onChange={(e) => setCompanions(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="rsvp-pref" className="mb-2 block text-sm font-medium text-ink-700">
            {t.prefSlotLabel}
          </label>
          <select id="rsvp-pref" className="field" value={pref} onChange={(e) => setPref(e.target.value)}>
            <option value="">{t.prefSlotNone}</option>
            {slotOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="rsvp-email" className="mb-2 block text-sm font-medium text-ink-700">
            {t.emailLabel}
          </label>
          <input
            id="rsvp-email"
            type="email"
            className="field"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-500">{t.emailHint}</p>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary mt-6 w-full sm:w-auto"
        aria-disabled={!ready || status === 'sending'}
      >
        {status === 'sending' ? t.submitting : t.submit}
      </button>

      {status === 'error' && (
        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-50 p-4 text-sm" role="alert">
          <p className="font-semibold text-amber-700">{t.errorTitle}</p>
          <p className="mt-1 text-ink-700">{t.errorBody}</p>
        </div>
      )}
    </form>
  );
}
