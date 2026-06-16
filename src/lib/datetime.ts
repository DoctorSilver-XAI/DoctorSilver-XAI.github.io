import type { Lang } from '@/i18n';
import { useTranslations } from '@/i18n';
import { SITE, type DayDef, type SlotDef } from '@/config/site';

/** « Mardi 7 juillet 2026 » / « Tuesday, 7 July 2026 ». */
export function formatDayFull(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  const wd = t.weekdays[day.dow];
  const mo = t.months[SITE.defenseMonth];
  return lang === 'fr'
    ? `${wd} ${day.dom} ${mo} ${SITE.defenseYear}`
    : `${wd}, ${day.dom} ${mo} ${SITE.defenseYear}`;
}

/** Jour de la semaine seul (« Mardi »). */
export function formatWeekday(day: DayDef, lang: Lang): string {
  return useTranslations(lang).weekdays[day.dow];
}

/** Quantième + mois (« 7 juillet »). */
export function formatDayDate(day: DayDef, lang: Lang): string {
  const t = useTranslations(lang);
  return `${day.dom} ${t.months[SITE.defenseMonth]}`;
}

/** Créneau : « 9 h–11 h » (FR) / « 9:00–11:00 » (EN). */
export function formatSlot(slot: SlotDef, lang: Lang): string {
  return lang === 'fr' ? `${slot.sh} h–${slot.eh} h` : `${slot.sh}:00–${slot.eh}:00`;
}
