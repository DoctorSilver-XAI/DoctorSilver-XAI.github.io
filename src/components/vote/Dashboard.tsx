import { useEffect, useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import type { SlotKey } from '@/config/site';
import { dayById, slotById, splitKey } from '@/config/site';
import { formatDayDate, formatDayFull, formatSlot, formatWeekday } from '@/lib/datetime';
import { fetchCreneauCounts, subscribeCreneauCounts } from '@/lib/availability';
import { aggregateMatrix, bestKeys, countsToMap, maxCount } from '@/lib/voteAggregation';

interface Props {
  lang: Lang;
  t: Dict['dashboard'];
}

function heat(n: number, max: number): string {
  if (max <= 0 || n <= 0) return '#F7FAFD';
  const a = 0.1 + 0.55 * (n / max);
  return `rgba(25,162,176,${a})`;
}

export default function Dashboard({ lang, t }: Props) {
  const [counts, setCounts] = useState<Record<SlotKey, number>>({});

  useEffect(() => {
    let active = true;
    fetchCreneauCounts()
      .then((rows) => {
        if (active) setCounts(countsToMap(rows));
      })
      .catch(() => {});
    const unsub = subscribeCreneauCounts((row) => {
      setCounts((prev) => ({ ...prev, [row.creneau]: row.n_dispo }));
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const matrix = useMemo(() => aggregateMatrix(counts), [counts]);
  const max = useMemo(() => maxCount(counts), [counts]);
  const best = useMemo(() => bestKeys(counts), [counts]);

  function describe(key: SlotKey): string {
    const { dayId, slotId } = splitKey(key);
    const day = dayById(dayId);
    const slot = slotById(slotId);
    if (!day || !slot) return key;
    return `${formatDayFull(day, lang)} · ${formatSlot(slot, lang)}`;
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-soft sm:p-7">
      <p className="mb-5 text-sm text-ink-500" aria-live="polite">
        {max > 0 ? (
          <>
            <span className="font-medium text-ink-700">{t.best} :</span>{' '}
            {best.map((k) => describe(k)).join(' · ')}{' '}
            <span className="font-mono text-teal-700">
              ({max} {t.votes})
            </span>
          </>
        ) : (
          t.empty
        )}
      </p>

      <div className="vote-grid">
        {matrix.map((row) => (
          <div className="day-col" key={row.day.id}>
            <div className="day-head">
              <div>
                <div className="day-name">{formatWeekday(row.day, lang)}</div>
                <div className="day-date">{formatDayDate(row.day, lang)}</div>
              </div>
            </div>
            <div className="day-slots">
              {row.cells.map((cell) => {
                const isBest = best.includes(cell.key) && max > 0;
                return (
                  <div
                    key={cell.key}
                    className="rounded-xl border px-2 py-3 text-center transition-colors"
                    style={{
                      background: heat(cell.n, max),
                      borderColor: isBest ? '#19A2B0' : '#E2E8F2',
                      boxShadow: isBest ? '0 0 0 1px rgba(25,162,176,.4)' : 'none',
                    }}
                    title={`${describe(cell.key)} : ${cell.n}`}
                  >
                    <div className="font-mono text-lg font-medium text-ink-900">{cell.n}</div>
                    <div className="text-[0.6rem] uppercase tracking-wide text-ink-400">
                      {formatSlot(cell.slot, lang)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
