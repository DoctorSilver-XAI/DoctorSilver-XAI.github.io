import type { Dict } from '@/i18n';
import { interpolate } from '@/i18n';

interface Props {
  /** Heure formatée du créneau (ex. « 9 h–11 h »). */
  label: string;
  /** Libellé accessible complet (jour + créneau + statut). */
  ariaLabel: string;
  selected: boolean;
  recommended: boolean;
  avoid: boolean;
  /** Nombre réel de disponibilités sur ce créneau (compteur Supabase). */
  count: number;
  t: Dict['vote'];
  onToggle: () => void;
}

export default function SlotCard({
  label,
  ariaLabel,
  selected,
  recommended,
  avoid,
  count,
  t,
  onToggle,
}: Props) {
  const className = ['slot', recommended && 'slot--reco', avoid && 'slot--avoid']
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={className} aria-pressed={selected} aria-label={ariaLabel} onClick={onToggle}>
      {recommended && <span className="slot__badge">{t.recoBadge}</span>}

      <span className="slot__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>

      <span className="slot__time">{label}</span>
      <span className="slot__state">{selected ? t.stateSelected : t.stateFree}</span>

      {count > 0 ? (
        <span className="proof">
          <span className="proof__txt">{interpolate('{n} {label}', { n: count, label: t.confirmedPeople })}</span>
        </span>
      ) : null}
    </button>
  );
}
