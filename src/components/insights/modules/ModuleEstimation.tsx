import { useState } from 'react';
import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; unit?: string };
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module estimation : curseur numérique avec valeur affichée en direct.
 * Lit la plage dans def.estimation (min, max, step).
 * answer_keys persistés = [String(valeur)].
 */
export default function ModuleEstimation({ def, copy, value, onChange, disabled }: Props) {
  const cfg = def.estimation!;
  const [v, setV] = useState<number>(value ? Number(value[0]) : Math.round((cfg.min + cfg.max) / 2));
  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-6 flex items-center gap-4">
        <input
          type="range"
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={v}
          onChange={(e) => {
            const n = Number(e.target.value);
            setV(n);
            onChange([String(n)]);
          }}
          className="flex-1 accent-clinical-600"
        />
        <span className="min-w-[72px] text-right font-display text-2xl text-ink-900">
          {v} {copy.unit ?? ''}
        </span>
      </div>
    </fieldset>
  );
}
