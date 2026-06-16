/**
 * Génération d'un fichier .ics (RFC 5545) côté client, sans dépendance.
 * Points de conformité couverts par les tests Vitest :
 *  - sauts de ligne CRLF (\r\n) ;
 *  - dates UTC au format YYYYMMDDTHHMMSSZ ;
 *  - échappement des caractères , ; \ et des retours ligne dans les champs texte ;
 *  - pliage (line folding) des lignes > 75 octets (UTF-8) avec espace de continuation ;
 *  - UID unique.
 */

export interface IcsEvent {
  uid: string;
  start: Date;
  end: Date;
  title: string;
  description?: string;
  location?: string;
  /** Horodatage de génération (DTSTAMP). Par défaut = start (injectable pour des tests déterministes). */
  stamp?: Date;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Date -> YYYYMMDDTHHMMSSZ (UTC). */
export function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Échappe le texte d'une valeur de propriété iCalendar. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Plie une ligne de contenu à 75 octets (UTF-8), continuation préfixée d'un espace. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  let isFirst = true;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    // 75 octets sur la 1re ligne ; 74 sur les suivantes (l'espace de continuation compte).
    const limit = isFirst ? 75 : 74;
    if (currentBytes + charBytes > limit) {
      out.push(current);
      current = char;
      currentBytes = charBytes;
      isFirst = false;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  out.push(current);
  return out.join('\r\n ');
}

/** Construit le contenu .ics complet pour un événement. */
export function generateICS(event: IcsEvent): string {
  const stamp = event.stamp ?? event.start;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soutenance Pierre//ISPB Lyon//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsDate(stamp)}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Déclenche le téléchargement d'un .ics dans le navigateur (no-op côté serveur). */
export function downloadICS(filename: string, content: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
