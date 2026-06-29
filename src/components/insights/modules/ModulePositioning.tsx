import { useState } from 'react';
import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; poleLeft: string; poleRight: string };
  value: string[] | null;
  onChange: (a: string[]) => void;
  disabled: boolean;
}

/**
 * Module positionnement : curseur entre deux pôles (échelle 0..100, pas de 10).
 * answer_keys persistés = [String(bucket)] avec bucket de 0 à 10.
 */
export default function ModulePositioning({ copy, value, onChange, disabled }: Props) {
  const [v, setV] = useState<number>(value ? Number(value[0]) * 10 : 50);
  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={v}
        onChange={(e) => {
          const n = Number(e.target.value);
          setV(n);
          onChange([String(Math.round(n / 10))]);
        }}
        className="mt-6 w-full accent-clinical-600"
      />
      <div className="mt-2 flex justify-between text-xs text-ink-500">
        <span>{copy.poleLeft}</span>
        <span>{copy.poleRight}</span>
      </div>
    </fieldset>
  );
}
