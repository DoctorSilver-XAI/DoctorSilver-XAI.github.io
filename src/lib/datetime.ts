import type { Lang } from '@/i18n';
import { useTranslations } from '@/i18n';
import type { DayDef, SlotDef } from '@/config/site';

/** « Lundi 20 juillet 2026 » / « Monday, 20 July 2026 ». */
export function formatDayFull(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  const wd = t.weekdays[day.dow];
  const mo = t.months[day.month];
  return lang === 'fr'
    ? `${wd} ${day.dom} ${mo} ${day.year}`
    : `${wd}, ${day.dom} ${mo} ${day.year}`;
}

/** Jour de la semaine seul (« Lundi »). */
export function formatWeekday(day: DayDef, lang: Lang): string {
  return useTranslations(lang).weekdays[day.dow];
}

/** Quantième + mois (« 20 juillet »). */
export function formatDayDate(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  return `${day.dom} ${t.months[day.month]}`;
}

/** Créneau : « 9 h–11 h » (FR) / « 9:00–11:00 » (EN). */
export function formatSlot(slot: SlotDef, lang: Lang): string {
  return lang === 'fr' ? `${slot.sh} h–${slot.eh} h` : `${slot.sh}:00–${slot.eh}:00`;
}

/** « Mercredi 22 juillet 2026 » (FR) / « Wednesday, 22 July 2026 » (EN). */
export function formatDefenseLong(iso: string, lang: Lang): string {
  const t = useTranslations(lang);
  const d = new Date(iso);
  const dow = ((d.getDay() + 6) % 7) + 1; // JS 0=dim..6=sam → 1=lundi..7=dimanche
  const wd = t.weekdays[dow];
  const mo = t.months[d.getMonth() + 1];
  return lang === 'fr'
    ? `${wd} ${d.getDate()} ${mo} ${d.getFullYear()}`
    : `${wd}, ${d.getDate()} ${mo} ${d.getFullYear()}`;
}

/** « 14 h–16 h » (FR) / « 14:00–16:00 » (EN). */
export function formatDefenseTime(iso: string, durationMin: number, lang: Lang): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const fmt = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    return lang === 'fr'
      ? `${h} h${m ? String(m).padStart(2, '0') : ''}`
      : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  return `${fmt(start)}–${fmt(end)}`;
}
