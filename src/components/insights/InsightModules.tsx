import { useEffect, useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import { interpolate } from '@/i18n';
import { SITE } from '@/config/site';
import { homeModules, juryModules, type ModuleDef } from '@/config/modules';
import { hasSupabase } from '@/lib/supabaseClient';
import {
  fetchModuleCounts,
  subscribeModuleCounts,
  submitModuleResponse,
  hasJuryAnsweredModule,
} from '@/lib/insights';
import {
  distribution,
  sliderAverage,
  slidersAverages,
  totalResponses,
  type ModuleAnswerCount,
} from '@/lib/insightsAggregation';
import ModuleSingleChoice from './modules/ModuleSingleChoice';
import ModuleMultiChoice from './modules/ModuleMultiChoice';
import ModuleTrueFalse from './modules/ModuleTrueFalse';
import ModuleEstimate from './modules/ModuleEstimate';
import ModuleSlider from './modules/ModuleSlider';
import ModuleSliders from './modules/ModuleSliders';
import ModuleOpenText from './modules/ModuleOpenText';

interface Props {
  lang: Lang;
  mode: 'public' | 'jury';
  t: Dict['insights'];
}

/** Forme commune (superset) de la copy localisée d'un module. */
interface ModuleCopy {
  q: string;
  opt: Record<string, string>;
  item: Record<string, string>;
  reveal: string;
  placeholder?: string;
}

/** Libellé d'acte (« Acte 1 — Vos repères ») pour un module. */
function actLabel(def: ModuleDef, t: Dict['insights']): string {
  const titles: Record<1 | 2 | 3 | 4, string> = {
    1: t.act1,
    2: t.act2,
    3: t.act3,
    4: t.act4,
  };
  return `${t.actLabel} ${def.act} — ${titles[def.act]}`;
}

export default function InsightModules({ mode, t }: Props) {
  const modules = useMemo<ModuleDef[]>(
    () => (mode === 'jury' ? juryModules() : homeModules()),
    [mode],
  );
  const [counts, setCounts] = useState<ModuleAnswerCount[]>([]);
  const [respondent, setRespondent] = useState('');
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  // Lecture initiale des compteurs publics + abonnement temps réel.
  useEffect(() => {
    let active = true;
    fetchModuleCounts()
      .then((rows) => active && setCounts(rows))
      .catch(() => {
        /* compteurs indisponibles : on révèle quand même la pédagogie */
      });
    const unsub = subscribeModuleCounts((row) =>
      setCounts((prev) => {
        const i = prev.findIndex(
          (c) => c.module_id === row.module_id && c.answer_key === row.answer_key,
        );
        if (i === -1) return [...prev, row];
        const nextCounts = [...prev];
        nextCounts[i] = row;
        return nextCounts;
      }),
    );
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const def = modules[index];
  const copy = (t.modules as unknown as Record<string, ModuleCopy>)[def.id];
  const needsIdentity = mode === 'jury' && !respondent;
  const isLast = index + 1 >= modules.length;

  // Une réponse est « prête » selon le type de module.
  const ready =
    def.type === 'open'
      ? draftText.trim().length > 0
      : def.type === 'multi'
        ? (draft?.length ?? 0) > 0
        : draft != null && draft.length > 0;
  const canSubmit = ready && !revealed && !needsIdentity;

  function renderView() {
    const shared = { def, copy, value: draft, disabled: revealed };
    switch (def.type) {
      case 'single':
        return <ModuleSingleChoice {...shared} onChange={(k) => setDraft(k)} />;
      case 'multi':
        return <ModuleMultiChoice {...shared} onChange={(k) => setDraft(k)} />;
      case 'truefalse':
        return <ModuleTrueFalse {...shared} onChange={(k) => setDraft(k)} />;
      case 'estimate':
        return <ModuleEstimate {...shared} onChange={(k) => setDraft(k)} />;
      case 'slider':
        return (
          <ModuleSlider
            def={def}
            copy={copy}
            labels={t}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'sliders':
        return (
          <ModuleSliders
            def={def}
            copy={copy}
            labels={t}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'open':
        return (
          <ModuleOpenText
            def={def}
            copy={copy}
            value={draft}
            disabled={revealed}
            onChange={(_k, text) => {
              setDraft([]);
              setDraftText(text ?? '');
            }}
          />
        );
      default:
        return null;
    }
  }

  async function submit() {
    if (!canSubmit) return;
    // Garde anti-double-réponse côté jury (booléen, zéro PII renvoyée).
    if (mode === 'jury' && respondent) {
      try {
        const already = await hasJuryAnsweredModule(respondent, def.id);
        if (already) {
          setRevealed(true);
          return;
        }
      } catch {
        /* on continue : la contrainte DB reste le garde-fou ultime */
      }
    }
    const answerKeys = draft ?? [];
    try {
      await submitModuleResponse({
        moduleId: def.id,
        context: mode,
        respondent: mode === 'jury' ? respondent : null,
        answerKeys,
        answerText: def.type === 'open' ? draftText.trim() : null,
      });
    } catch {
      /* dégradation : on révèle quand même la pédagogie */
    }
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    setDraft(null);
    setDraftText('');
    if (isLast) setDone(true);
    else setIndex(index + 1);
  }

  // Distribution / moyenne du pool public pour le module courant (révélation).
  const optionKeys = (def.options ?? []).map((o) => o.key);
  const shares = optionKeys.length ? distribution(counts, def.id, optionKeys) : [];
  const total = totalResponses(counts, def.id);
  const sliderAvg = def.type === 'slider' ? sliderAverage(counts, def.id) : null;
  const slidersAvg =
    def.type === 'sliders'
      ? slidersAverages(
          counts,
          def.id,
          (def.items ?? []).map((it) => it.key),
        )
      : null;
  const hasAggregate = hasSupabase && total > 0;

  // Libellé lisible d'une clé d'option (pour « votre réponse » et la distribution).
  function optLabel(key: string): string {
    return (copy.opt?.[key] as string) ?? key;
  }
  function itemLabel(key: string): string {
    return (copy.item?.[key] as string) ?? key;
  }

  // Écran final.
  if (done) {
    return (
      <div className="instrument p-6 text-center sm:p-10">
        <p className="font-display text-2xl text-ink-900">{t.thanksTitle}</p>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-600">{t.thanksBody}</p>
      </div>
    );
  }

  return (
    <div className="instrument p-5 sm:p-8 md:p-10">
      {/* Progression */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider text-ink-500">
          <span>{actLabel(def, t)}</span>
          <span>{interpolate(t.progress, { n: index + 1, total: modules.length })}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-teal-500 transition-[width] duration-500"
            style={{ width: `${Math.round(((index + 1) / modules.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Identité (mode jury) */}
      {mode === 'jury' && (
        <div className="mb-7">
          <label htmlFor="insight-respondent" className="mb-2 block text-sm font-medium text-ink-700">
            {t.identityLabel}
          </label>
          <select
            id="insight-respondent"
            className="field"
            value={respondent}
            onChange={(e) => setRespondent(e.target.value)}
          >
            <option value="">{t.identityPlaceholder}</option>
            {SITE.jury.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Question courante */}
      <div className="mb-7">{renderView()}</div>

      {/* Action : valider */}
      {!revealed && (
        <div>
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            data-testid="insight-submit"
            aria-disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {t.submit}
          </button>
          {needsIdentity && (
            <p className="mt-3 text-xs text-ink-500">{t.identityPlaceholder}</p>
          )}
        </div>
      )}

      {/* Révélation : à retenir + votre réponse + distribution du pool public */}
      {revealed && (
        <div
          className="rounded-2xl border border-teal-500/40 bg-teal-50/70 p-5 sm:p-6"
          data-testid="insight-reveal"
          role="status"
          aria-live="polite"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-teal-700">{t.revealLabel}</p>
          <p className="mt-2 leading-relaxed text-ink-800">{copy.reveal}</p>

          {/* Votre réponse */}
          {def.type === 'open'
            ? draftText.trim() && (
                <div className="mt-4">
                  <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                    {t.youAnswered}
                  </p>
                  <p className="mt-1 italic text-ink-700">« {draftText.trim()} »</p>
                </div>
              )
            : (draft?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                    {t.youAnswered}
                  </p>
                  <ul className="mt-1 space-y-1 text-ink-700">
                    {(draft ?? []).map((k) => {
                      const label =
                        def.type === 'sliders'
                          ? `${itemLabel(k.split(':')[0])} : ${k.split(':')[1]}/10`
                          : def.type === 'slider'
                            ? `${Number(k) * 10}/${def.sliderMax ?? 100}`
                            : optLabel(k);
                      return (
                        <li key={k} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                          <span>{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

          {/* Distribution / moyenne du pool public */}
          {!hasSupabase ? (
            <p className="mt-4 rounded-xl border border-clinical-400/35 bg-white/70 p-3 text-sm text-ink-600">
              {t.demoNotice}
            </p>
          ) : !hasAggregate ? (
            <p className="mt-4 text-sm text-ink-500">{t.noData}</p>
          ) : optionKeys.length ? (
            <div className="mt-5">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                {t.distributionLabel}
              </p>
              <ul className="mt-3 space-y-2.5">
                {shares.map((s) => {
                  const highlight =
                    (def.type === 'estimate' || def.type === 'truefalse') &&
                    def.correctKey === s.key;
                  return (
                    <li key={s.key}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className={highlight ? 'font-semibold text-teal-700' : 'text-ink-700'}>
                          {optLabel(s.key)}
                          {highlight && ' ✓'}
                        </span>
                        <span className="font-mono text-xs text-ink-500">{s.pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full rounded-full ${
                            highlight
                              ? 'bg-gradient-to-r from-teal-500 to-teal-400'
                              : 'bg-gradient-to-r from-clinical-500 to-clinical-400'
                          }`}
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : def.type === 'slider' && sliderAvg != null ? (
            <div className="mt-5">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                {t.distributionLabel}
              </p>
              <div className="mt-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-500">
                <span>{t.sliderLeft}</span>
                <span>{t.sliderRight}</span>
              </div>
              <div className="relative mt-1 h-2 w-full rounded-full bg-line">
                <span
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-500 shadow"
                  style={{ left: `${Math.min(100, Math.max(0, sliderAvg * 10))}%` }}
                />
              </div>
            </div>
          ) : def.type === 'sliders' && slidersAvg ? (
            <div className="mt-5">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                {t.distributionLabel}
              </p>
              <ul className="mt-3 space-y-2.5">
                {(def.items ?? []).map((it) => {
                  const avg = slidersAvg[it.key];
                  return (
                    <li key={it.key}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-700">{itemLabel(it.key)}</span>
                        <span className="font-mono text-xs text-ink-500">
                          {avg != null ? `${avg.toFixed(1)}/10` : '—'}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-clinical-400"
                          style={{ width: `${avg != null ? Math.min(100, avg * 10) : 0}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* Navigation */}
          <div className="mt-6 flex justify-end">
            <button type="button" className="btn btn-primary" onClick={next}>
              {isLast ? t.finish : t.next}
            </button>
          </div>
        </div>
      )}

      {/* Bandeau confidentialité (mode jury) */}
      {mode === 'jury' && (
        <p className="mt-6 text-xs leading-relaxed text-ink-500">{t.privacyJury}</p>
      )}
    </div>
  );
}
