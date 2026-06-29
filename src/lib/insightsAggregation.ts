export interface ModuleAnswerCount { module_id: string; answer_key: string; n: number }
export interface OptionShare { key: string; n: number; pct: number }

export function countsForModule(counts: ModuleAnswerCount[], moduleId: string): ModuleAnswerCount[] {
  return counts.filter((c) => c.module_id === moduleId);
}

export function totalResponses(counts: ModuleAnswerCount[], moduleId: string): number {
  return countsForModule(counts, moduleId).reduce((s, c) => s + c.n, 0);
}

export function distribution(counts: ModuleAnswerCount[], moduleId: string, optionKeys: string[]): OptionShare[] {
  const rows = countsForModule(counts, moduleId);
  const total = rows.reduce((s, c) => s + c.n, 0);
  return optionKeys.map((key) => {
    const n = rows.find((c) => c.answer_key === key)?.n ?? 0;
    return { key, n, pct: total > 0 ? Math.round((100 * n) / total) : 0 };
  });
}

function bucketMean(rows: ModuleAnswerCount[]): number | null {
  let weighted = 0;
  let count = 0;
  for (const r of rows) {
    const v = Number(r.answer_key);
    if (!Number.isNaN(v)) {
      weighted += v * r.n;
      count += r.n;
    }
  }
  return count > 0 ? weighted / count : null;
}

export function sliderAverage(counts: ModuleAnswerCount[], moduleId: string): number | null {
  return bucketMean(countsForModule(counts, moduleId));
}

export function slidersAverages(
  counts: ModuleAnswerCount[],
  moduleId: string,
  itemKeys: string[],
): Record<string, number | null> {
  const rows = countsForModule(counts, moduleId);
  const out: Record<string, number | null> = {};
  for (const item of itemKeys) {
    const itemRows = rows
      .filter((r) => r.answer_key.startsWith(`${item}:`))
      .map((r) => ({ ...r, answer_key: r.answer_key.slice(item.length + 1) }));
    out[item] = bucketMean(itemRows);
  }
  return out;
}
