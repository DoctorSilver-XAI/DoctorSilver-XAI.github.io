import type { ModuleDef } from '@/config/modules';

/** Sous-ensemble de `Dict['insights']` réellement consommé par ce module. */
interface SlidersLabels {
  familiarityLow: string;
  familiarityHigh: string;
}

interface Props {
  def: ModuleDef;
  copy: { q: string; item: Record<string, string> };
  labels: SlidersLabels;
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

const DEFAULT_BUCKET = 5; // milieu de l'échelle 0..10 tant qu'aucune réponse.

/**
 * Module multi-curseurs (familiarité par notion). Un curseur 0..10 par `def.items`.
 * answer_keys persistés = une clé `item:bucket` par item (ex. 'shap:7').
 * Le composant est contrôlé par `value` : on en dérive le bucket courant de
 * chaque item, puis chaque interaction renvoie la liste complète des clés.
 */
export default function ModuleSliders({ def, copy, labels, value, onChange, disabled }: Props) {
  const items = def.items ?? [];

  // Reconstruit la map { itemKey: bucket } à partir des answer_keys 'item:bucket'.
  function readBuckets(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const it of items) {
      const found = (value ?? []).find((k) => k.startsWith(`${it.key}:`));
      const n = found ? Number(found.slice(it.key.length + 1)) : NaN;
      out[it.key] = Number.isNaN(n) ? DEFAULT_BUCKET : n;
    }
    return out;
  }

  function setItem(itemKey: string, bucket: number) {
    const buckets = readBuckets();
    buckets[itemKey] = bucket;
    onChange(items.map((it) => `${it.key}:${buckets[it.key]}`));
  }

  const buckets = readBuckets();

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-6 grid gap-6">
        {items.map((it) => {
          const inputId = `${def.id}-${it.key}`;
          return (
            <div key={it.key}>
              <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-ink-700">
                {copy.item[it.key]}
              </label>
              <input
                id={inputId}
                type="range"
                min={0}
                max={10}
                step={1}
                value={buckets[it.key]}
                aria-valuetext={`${buckets[it.key]} / 10`}
                onChange={(e) => setItem(it.key, Number(e.target.value))}
                className="w-full accent-clinical-600"
              />
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
