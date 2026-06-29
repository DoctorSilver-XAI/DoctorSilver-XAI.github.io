import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; opt: Record<string, string> };
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module à choix multiple : chaque option est un toggle indépendant.
 * On dérive l'ensemble sélectionné de `value` (source unique : pas d'état local
 * désynchronisé), et chaque bascule renvoie la liste complète des clés cochées.
 * answer_keys persistés = [...clésCochées]. Aucune soumission implicite.
 */
export default function ModuleMultiChoice({ def, copy, value, onChange, disabled }: Props) {
  const selected = new Set(value ?? []);

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-5 grid gap-3">
        {(def.options ?? []).map((o) => {
          const checked = selected.has(o.key);
          return (
            <button
              key={o.key}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(o.key)}
              className={`btn ${checked ? 'btn-primary' : 'btn-ghost'} w-full justify-start gap-3 text-left`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 flex-none place-items-center rounded-md border ${
                  checked ? 'border-white/70 bg-white/20' : 'border-line bg-white'
                }`}
              >
                {checked && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </span>
              <span>{copy.opt[o.key]}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
