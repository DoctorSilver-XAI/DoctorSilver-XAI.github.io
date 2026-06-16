import type { Lang } from '@/i18n';
import { useTranslations, interpolate } from '@/i18n';
import { SITE, dayById, slotById, splitKey, type Role, type SlotKey } from '@/config/site';
import { formatDayFull, formatSlot } from './datetime';

export interface AvailabilityInput {
  name: string;
  role: Role;
  /** Clés de créneaux sélectionnées (dans n'importe quel ordre). */
  slots: SlotKey[];
  lang: Lang;
}

/** Trie les clés sélectionnées dans l'ordre canonique (jour puis créneau de CONFIG). */
export function orderSlotKeys(keys: SlotKey[]): SlotKey[] {
  const order = new Map<string, number>();
  let i = 0;
  for (const d of SITE.days) for (const s of SITE.slots) order.set(`${d.id}__${s.id}`, i++);
  return [...keys].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}

/** Libellé lisible d'un créneau (« Mardi 7 juillet 2026 · 9 h–11 h ⭐ »). */
export function describeSlot(key: SlotKey, lang: Lang): string {
  const { dayId, slotId } = splitKey(key);
  const day = dayById(dayId);
  const slot = slotById(slotId);
  if (!day || !slot) return key;
  const star = key === SITE.recommendedSlot ? ' ⭐' : '';
  return `${formatDayFull(day, lang)} · ${formatSlot(slot, lang)}${star}`;
}

/** Texte de résumé lisible (réutilisé pour le mailto ET le bouton « copier »). */
export function buildSummaryText(input: AvailabilityInput): string {
  const t = useTranslations(input.lang);
  const roleLabel = input.role === 'jury' ? t.vote.roleJury : t.vote.roleGuest;
  const ordered = orderSlotKeys(input.slots);

  const lines: string[] = [
    t.mail.greeting,
    '',
    t.mail.intro,
    '',
    `${t.mail.name} : ${input.name || t.vote.summaryNameMissing}`,
    `${t.mail.role} : ${roleLabel}`,
    '',
    t.mail.slotsHeader,
  ];

  if (ordered.length === 0) {
    lines.push(`  ${t.mail.none}`);
  } else {
    for (const key of ordered) lines.push(`  • ${describeSlot(key, input.lang)}`);
  }

  lines.push('', t.mail.footer);
  return lines.join('\n');
}

/** Construit l'URL mailto (sujet + corps encodés). */
export function buildMailto(input: AvailabilityInput): string {
  const t = useTranslations(input.lang);
  const subject = interpolate(t.mail.subject, { name: input.name || '?' });
  const body = buildSummaryText(input);
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
