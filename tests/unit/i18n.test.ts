import { describe, it, expect } from 'vitest';
import { fr } from '@/i18n/fr';
import { en } from '@/i18n/en';

/** Collecte les chemins de clés (les tableaux sont traités comme des feuilles). */
function collect(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [prefix];
  const out: string[] = [];
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    out.push(...collect((obj as Record<string, unknown>)[k], p));
  }
  return out.sort();
}

describe('i18n', () => {
  it('FR et EN exposent exactement les mêmes clés (filet en plus du typage)', () => {
    expect(collect(en)).toEqual(collect(fr));
  });
});
