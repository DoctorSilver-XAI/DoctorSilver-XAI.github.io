import type { ModuleDef } from '@/config/modules';

interface Props {
  def: ModuleDef;
  copy: { q: string; items: Record<string, string>; categories: Record<string, string> };
  value: string[] | null;
  onChange: (answerKeys: string[]) => void;
  disabled: boolean;
}

/**
 * Module concept-map : pour chaque item, on choisit une catégorie parmi
 * def.conceptMap.categories (sélection unique par item via aria-pressed).
 * Pas de glisser-déposer. La validation est possible une fois tous les items
 * assignés (à la charge du moteur, via la longueur des answer_keys).
 * answer_keys persistés = une clé item:categorie par item assigné.
 */
export default function ModuleConceptMap({ def, copy, value, onChange, disabled }: Props) {
  const cfg = def.conceptMap!;
  const items = cfg.items;
  const categories = cfg.categories;

  // Reconstruit la map { itemKey: categoryKey } à partir des answer_keys item:categorie.
  function readAssignments(): Record<string, string | null> {
    const out: Record<string, string | null> = {};
    for (const it of items) {
      const found = (value ?? []).find((k) => k.startsWith(`${it.key}:`));
      out[it.key] = found ? found.slice(it.key.length + 1) : null;
    }
    return out;
  }

  function assign(itemKey: string, categoryKey: string) {
    const current = readAssignments();
    current[itemKey] = categoryKey;
    const keys: string[] = [];
    for (const it of items) {
      const cat = current[it.key];
      if (cat !== null) keys.push(`${it.key}:${cat}`);
    }
    onChange(keys);
  }

  const assignments = readAssignments();

  return (
    <fieldset disabled={disabled}>
      <legend className="font-display text-xl text-ink-900">{copy.q}</legend>
      <div className="mt-6 grid gap-5">
        {items.map((it) => {
          const current = assignments[it.key];
          return (
            <div key={it.key} className="rounded-2xl border border-line bg-[#FBFDFF] p-4">
              <p className="mb-3 text-sm font-medium text-ink-700">{copy.items[it.key]}</p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={copy.items[it.key]}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    aria-pressed={current === cat.key}
                    onClick={() => assign(it.key, cat.key)}
                    className={`btn ${current === cat.key ? 'btn-primary' : 'btn-ghost'} justify-start text-left`}
                  >
                    {copy.categories[cat.key]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
