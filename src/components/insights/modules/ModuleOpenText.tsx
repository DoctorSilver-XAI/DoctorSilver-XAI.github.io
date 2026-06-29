import { useEffect, useState } from 'react';
import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; placeholder?: string };
  value: string[] | null;
  onChange: (answerKeys: string[], answerText?: string) => void;
  disabled: boolean;
}

const MAX_LEN = 1000;

/**
 * Module texte libre (réponse ouverte, optionnelle).
 * answer_keys persistés = [] ; le contenu part dans answerText.
 * Le texte saisi vit dans le state du parent (draftText) mais n'est pas reflété
 * dans `value` (qui ne porte que les clés) : on garde donc un miroir local,
 * réinitialisé quand on change de module (changement de `def.id`).
 */
export default function ModuleOpenText({ def, copy, value, onChange, disabled }: Props) {
  const [text, setText] = useState('');

  // Réinitialise le champ au changement de module ou quand le parent vide la réponse.
  useEffect(() => {
    if (!value || value.length === 0) setText('');
  }, [def.id, value]);

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <textarea
        className="field mt-5 min-h-[120px] resize-y"
        maxLength={MAX_LEN}
        placeholder={copy.placeholder}
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          onChange([], next);
        }}
      />
      <p className="mt-2 text-right font-mono text-xs text-ink-500">
        {text.length}/{MAX_LEN}
      </p>
    </fieldset>
  );
}
