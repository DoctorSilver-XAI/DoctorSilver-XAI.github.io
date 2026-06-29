import type { ModuleDef } from '@/config/modules';
import type { Dict } from '@/i18n';

interface Props {
  def: ModuleDef;
  copy: { q: string; items: Record<string, string> };
  labels: Dict['insights'];
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module familiarité : une échelle compacte (0..scale) en boutons cliquables
 * par notion. Sélection unique par item via aria-pressed. Les extrémités
 * portent labels.familiarityLow et labels.familiarityHigh.
 * answer_keys persistés = une clé item:valeur par item renseigné.
 */
export default function ModuleFamiliarity({ def, copy, labels, value, onChange, disabled }: Props) {
  const cfg = def.familiarity!;
  const items = cfg.items;
  const levels = Array.from({ length: cfg.scale + 1 }, (_, i) => i);

  // Reconstruit la map { itemKey: valeur } à partir des answer_keys item:valeur.
  function readValues(): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const it of items) {
      const found = (value ?? []).find((k) => k.startsWith(`${it.key}:`));
      const n = found ? Number(found.slice(it.key.length + 1)) : NaN;
      out[it.key] = Number.isNaN(n) ? null : n;
    }
    return out;
  }

  function setItem(itemKey: string, level: number) {
    const current = readValues();
    current[itemKey] = level;
    const keys: string[] = [];
    for (const it of items) {
      const v = current[it.key];
      if (v !== null) keys.push(`${it.key}:${v}`);
    }
    onChange(keys);
  }

  const values = readValues();

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-6 grid gap-5">
        {items.map((it) => {
          const selected = values[it.key];
          return (
            <div key={it.key}>
              <p className="mb-2 text-sm font-medium text-ink-700">{copy.items[it.key]}</p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={copy.items[it.key]}
              >
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={selected === level}
                    onClick={() => setItem(it.key, level)}
                    className={`btn ${selected === level ? 'btn-primary' : 'btn-ghost'} h-10 w-10 justify-center p-0`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                <span>{labels.familiarityLow}</span>
                <span>{labels.familiarityHigh}</span>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
