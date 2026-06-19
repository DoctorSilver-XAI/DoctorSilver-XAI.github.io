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
