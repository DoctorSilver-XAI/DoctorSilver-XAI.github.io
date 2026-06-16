import { SITE } from '@/config/site';
import { downloadICS, generateICS } from '@/lib/ics';

interface Props {
  label: string;
  /** Titre de l'évènement (déjà localisé). */
  title: string;
}

/** Bouton « Ajouter à mon agenda » : génère un .ics côté client à partir de la config. */
export default function AddToCalendar({ label, title }: Props) {
  function onClick() {
    const d = SITE.defenseDate;
    if (!d) return;
    const start = new Date(d.startISO);
    const end = new Date(start.getTime() + d.durationMin * 60_000);
    const ics = generateICS({
      uid: `soutenance-pierre-${start.getTime()}@ispb-lyon`,
      start,
      end,
      title,
      location: `${SITE.venue.name}, ${SITE.venue.address}`,
      description: title,
    });
    downloadICS('soutenance-pierre.ics', ics);
  }

  return (
    <button type="button" className="btn cta-hero" onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4M12 13v4M10 15h4" />
      </svg>
      {label}
    </button>
  );
}
