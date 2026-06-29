import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; opt: Record<string, string> };
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module « Vrai / Faux » : deux options exclusives rendues en boutons segmentés.
 * answer_keys persistés = [optionKey] (ex. ['vrai'] | ['faux']).
 * La mise en avant de `def.correctKey` se fait à la révélation (InsightModules), pas ici.
 */
export default function ModuleTrueFalse({ def, copy, value, onChange, disabled }: Props) {
  const current = value?.[0] ?? null;
  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(def.options ?? []).map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={current === o.key}
            onClick={() => onChange([o.key])}
            className={`btn ${current === o.key ? 'btn-primary' : 'btn-ghost'} w-full justify-center`}
          >
            {copy.opt[o.key]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
