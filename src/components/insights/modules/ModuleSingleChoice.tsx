import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; opt: Record<string, string> };
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module à choix unique : n options exclusives en liste verticale.
 * answer_keys persistés = [optionKey].
 */
export default function ModuleSingleChoice({ def, copy, value, onChange, disabled }: Props) {
  const current = value?.[0] ?? null;
  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-5 grid gap-3">
        {(def.options ?? []).map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={current === o.key}
            onClick={() => onChange([o.key])}
            className={`btn ${current === o.key ? 'btn-primary' : 'btn-ghost'} w-full justify-start text-left`}
          >
            {copy.opt[o.key]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
