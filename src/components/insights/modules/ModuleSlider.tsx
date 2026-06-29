import type { ModuleDef } from '@/config/modules';

/** Sous-ensemble de `Dict['insights']` réellement consommé par ce module. */
interface SliderLabels {
  sliderLeft: string;
  sliderRight: string;
}

interface Props {
  def: ModuleDef;
  copy: { q: string };
  labels: SliderLabels;
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module curseur (axe substitution ↔ augmentation).
 * Échelle 0..sliderMax (défaut 100), pas de 10. Le bucket persisté est
 * `Math.round(value / 10)` ('0'..'10'), renvoyé via onChange([String(bucket)]).
 * La valeur affichée par défaut est médiane (50) tant qu'aucune réponse n'existe ;
 * le marquage « répondu » (après interaction) est géré par InsightModules.
 */
export default function ModuleSlider({ def, copy, labels, value, onChange, disabled }: Props) {
  const max = def.sliderMax ?? 100;
  // value persistée = bucket (0..10) → on le ré-étale sur l'échelle d'affichage.
  const bucket = value?.[0] != null ? Number(value[0]) : null;
  const current = bucket != null && !Number.isNaN(bucket) ? bucket * 10 : Math.round(max / 2);

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500">
          <span>{labels.sliderLeft}</span>
          <span>{labels.sliderRight}</span>
        </div>
        <input
          type="range"
          min={0}
          max={max}
          step={10}
          value={current}
          aria-valuetext={`${current} / ${max}`}
          onChange={(e) => onChange([String(Math.round(Number(e.target.value) / 10))])}
          className="w-full accent-clinical-600"
        />
      </div>
    </fieldset>
  );
}
