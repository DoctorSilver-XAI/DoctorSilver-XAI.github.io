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

export interface HistogramBin { start: number; end: number; n: number }

export function totalForModule(counts: ModuleAnswerCount[], moduleId: string): number {
  return counts.filter((c) => c.module_id === moduleId).reduce((s, c) => s + c.n, 0);
}

export function histogram(
  counts: ModuleAnswerCount[],
  moduleId: string,
  opts: { min: number; max: number; binSize: number },
): HistogramBin[] {
  const rows = counts.filter((c) => c.module_id === moduleId);
  const bins: HistogramBin[] = [];
  for (let start = opts.min; start < opts.max; start += opts.binSize) {
    bins.push({ start, end: start + opts.binSize, n: 0 });
  }
  for (const r of rows) {
    const v = Number(r.answer_key);
    if (Number.isNaN(v)) continue;
    const idx = Math.min(bins.length - 1, Math.floor((v - opts.min) / opts.binSize));
    if (idx >= 0) bins[idx].n += r.n;
  }
  return bins;
}

export function majorityBin(bins: HistogramBin[]): HistogramBin | null {
  let best: HistogramBin | null = null;
  for (const b of bins) {
    if (b.n > 0 && (!best || b.n > best.n)) best = b;
  }
  return best;
}

export function familiarityAverages(
  counts: ModuleAnswerCount[],
  moduleId: string,
  itemKeys: string[],
): Record<string, number | null> {
  const rows = counts.filter((c) => c.module_id === moduleId);
  const out: Record<string, number | null> = {};
  for (const item of itemKeys) {
    let weighted = 0;
    let count = 0;
    for (const r of rows) {
      if (!r.answer_key.startsWith(`${item}:`)) continue;
      const v = Number(r.answer_key.slice(item.length + 1));
      if (Number.isNaN(v)) continue;
      weighted += v * r.n;
      count += r.n;
    }
    out[item] = count > 0 ? weighted / count : null;
  }
  return out;
}
