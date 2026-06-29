import { useEffect, useState } from 'react';
import type { Dict } from '@/i18n';
import type { Axis, ModuleDef } from '@/config/modules';
import { MODULES, moduleById } from '@/config/modules';
import {
  familiarityAverages,
  sliderAverage,
  type ModuleAnswerCount,
} from '@/lib/insightsAggregation';

/**
 * Synthèse de fin de parcours.
 * Radar SVG sobre de la familiarité déclarée du participant, récapitulatif par
 * axe (réponse clé du participant plus positionnement du collectif si dispo),
 * et mot d'invitation. Aucune dépendance externe, polygone calculé à la main.
 */

/** Réponses du participant, indexées par identifiant de module (answer_keys bruts). */
export type AnswersByModule = Record<string, string[] | undefined>;

interface Props {
  /** Réponses du participant pour chaque module abordé. */
  answers: AnswersByModule;
  /** Compteurs agrégés du collectif (pour le positionnement par axe). */
  counts: ModuleAnswerCount[];
  /** Le backend est-il disponible (sinon, pas de couche collective). */
  hasSupabase: boolean;
  /** Section i18n complète. */
  labels: Dict['insights'];
}

/** Ordre canonique des axes pour le récapitulatif. */
const AXES: Axis[] = ['langage', 'diagnostic', 'suivi', 'explicabilite'];

/** Libellé lisible d'un axe via les clés i18n axisLangage, axisDiagnostic, etc. */
function axisLabel(axis: Axis, labels: Dict['insights']): string {
  const map: Record<Axis, string> = {
    langage: labels.axisLangage,
    diagnostic: labels.axisDiagnostic,
    suivi: labels.axisSuivi,
    explicabilite: labels.axisExplicabilite,
  };
  return map[axis];
}

/** Hook minimal, vrai si l'utilisateur demande la réduction des animations. */
function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

/** Valeur de familiarité du participant pour un item (0 si non répondu). */
function familiarityValueFor(answers: string[] | undefined, itemKey: string): number {
  if (!answers) return 0;
  const hit = answers.find((a) => a.startsWith(`${itemKey}:`));
  if (!hit) return 0;
  const v = Number(hit.slice(itemKey.length + 1));
  return Number.isNaN(v) ? 0 : v;
}

/**
 * Phrase de récapitulatif pour un module, selon son type.
 * Rappelle la réponse clé du participant, et le collectif si disponible.
 */
function recapForModule(
  def: ModuleDef,
  answers: AnswersByModule,
  counts: ModuleAnswerCount[],
  hasSupabase: boolean,
  copy: ModuleCopy | undefined,
  labels: Dict['insights'],
): { you: string | null; collective: string | null } {
  const mine = answers[def.id];

  if (def.type === 'estimation') {
    const cfg = def.estimation;
    const unit = copy?.unit ? ` ${copy.unit}` : '';
    const you = mine && mine.length > 0 ? `${Number(mine[0])}${unit}` : null;
    const avg = hasSupabase ? sliderAverage(counts, def.id) : null;
    const collective = avg != null ? `${labels.collective} : ${Math.round(avg)}${unit}` : null;
    void cfg;
    return { you, collective };
  }

  if (def.type === 'positioning') {
    const left = copy?.poleLeft ?? '';
    const right = copy?.poleRight ?? '';
    // bucket de 0 a 10 -> pourcentage vers le pole droit.
    const you =
      mine && mine.length > 0
        ? `${Math.round(Number(mine[0]) * 10)}% vers (${right || labels.familiarityHigh})`
        : null;
    const avg = hasSupabase ? sliderAverage(counts, def.id) : null;
    const collective =
      avg != null ? `${labels.collective} : ${Math.round(avg * 10)}% vers (${right})` : null;
    void left;
    return { you, collective };
  }

  if (def.type === 'single') {
    const key = mine && mine.length > 0 ? mine[0] : null;
    const you = key ? (copy?.options?.[key] ?? key) : null;
    return { you, collective: null };
  }

  if (def.type === 'concept-map') {
    const assigned = mine?.length ?? 0;
    const total = def.conceptMap?.items.length ?? 0;
    const you = assigned > 0 ? `${assigned}/${total}` : null;
    return { you, collective: null };
  }

  // familiarity : porté par le radar, pas de ligne de rappel chiffrée ici.
  return { you: null, collective: null };
}

/** Forme partielle de la copy i18n d'un module (clés selon le type). */
interface ModuleCopy {
  q?: string;
  unit?: string;
  poleLeft?: string;
  poleRight?: string;
  options?: Record<string, string>;
  items?: Record<string, string>;
  reveal?: string;
}

export default function SynthesisRadar({ answers, counts, hasSupabase, labels }: Props) {
  const reduce = usePrefersReducedMotion();
  const moduleCopies = labels.modules as unknown as Record<string, ModuleCopy>;

  // Module de familiarité, source du radar.
  const famDef = moduleById('familiarite');
  const famItems = famDef?.familiarity?.items.map((it) => it.key) ?? [];
  const famScale = famDef?.familiarity?.scale ?? 5;
  const famCopy = moduleCopies['familiarite'];
  const famAnswers = answers['familiarite'];
  const famCollective = hasSupabase
    ? familiarityAverages(counts, 'familiarite', famItems)
    : {};

  // Géométrie du radar.
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 96;
  const rings = [0.25, 0.5, 0.75, 1];
  const n = famItems.length;

  // Point cartésien pour l'axe i (0 en haut, sens horaire) à une fraction f (0..1).
  function point(i: number, f: number): [number, number] {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
    return [cx + radius * f * Math.cos(angle), cy + radius * f * Math.sin(angle)];
  }

  const myPolygon =
    n > 0
      ? famItems
          .map((key, i) => {
            const v = familiarityValueFor(famAnswers, key);
            const [x, y] = point(i, famScale > 0 ? v / famScale : 0);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : '';

  return (
    <div className="instrument p-5 sm:p-8 md:p-10">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-500">
        {labels.synthesisTitle}
      </p>

      {/* Radar de familiarité */}
      {n > 0 && (
        <div className="mt-6">
          <p className="font-display text-xl text-ink-900">{labels.synthesisFamiliarity}</p>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              width={size}
              height={size}
              className="max-w-[260px] flex-none"
              role="img"
              aria-label={labels.synthesisFamiliarity}
            >
              {/* Anneaux de repère */}
              {rings.map((f) => {
                const pts = famItems
                  .map((_, i) => {
                    const [x, y] = point(i, f);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={f}
                    points={pts}
                    fill="none"
                    stroke="#E2E8F2"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Rayons */}
              {famItems.map((_, i) => {
                const [x, y] = point(i, 1);
                return (
                  <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F2" strokeWidth={1} />
                );
              })}

              {/* Polygone du participant */}
              {myPolygon && (
                <polygon
                  points={myPolygon}
                  fill="rgba(25,162,176,0.18)"
                  stroke="#19A2B0"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  style={
                    reduce
                      ? undefined
                      : { transition: 'all 600ms cubic-bezier(0.22, 1, 0.36, 1)' }
                  }
                />
              )}

              {/* Sommets du participant */}
              {myPolygon &&
                famItems.map((key, i) => {
                  const v = familiarityValueFor(famAnswers, key);
                  const [x, y] = point(i, famScale > 0 ? v / famScale : 0);
                  return <circle key={key} cx={x} cy={y} r={3} fill="#127E89" />;
                })}
            </svg>

            {/* Légende des axes, avec valeur du participant et moyenne du collectif */}
            <ul className="w-full space-y-2.5 text-sm">
              {famItems.map((key) => {
                const mineVal = familiarityValueFor(famAnswers, key);
                const avg = famCollective[key];
                return (
                  <li key={key} className="flex items-baseline justify-between gap-3">
                    <span className="text-ink-700">{famCopy?.items?.[key] ?? key}</span>
                    <span className="flex items-baseline gap-3 font-mono text-xs">
                      <span className="text-teal-700">{mineVal}/{famScale}</span>
                      {avg != null && (
                        <span className="text-ink-400">
                          {labels.collective} {avg.toFixed(1)}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-wider text-ink-400">
            <span>{labels.familiarityLow}</span>
            <span>{labels.familiarityHigh}</span>
          </div>
        </div>
      )}

      {/* Récapitulatif par axe */}
      <div className="mt-8 border-t border-line pt-6">
        <ul className="space-y-5">
          {AXES.map((axis) => {
            const axisModules = MODULES.filter((m) => m.axis === axis);
            return (
              <li key={axis}>
                <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
                  {axisLabel(axis, labels)}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {axisModules.map((def) => {
                    const copy = moduleCopies[def.id];
                    const { you, collective } = recapForModule(
                      def,
                      answers,
                      counts,
                      hasSupabase,
                      copy,
                      labels,
                    );
                    if (!you && !collective) return null;
                    return (
                      <li key={def.id} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-500" />
                        <span className="text-ink-700">
                          {you && (
                            <>
                              <span className="text-ink-500">{labels.youAnswered} : </span>
                              <strong className="font-semibold text-ink-900">{you}</strong>
                            </>
                          )}
                          {collective && (
                            <span className="text-ink-500">
                              {you ? ' · ' : ''}
                              {collective}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mot d'invitation */}
      <p className="mt-8 font-display text-lg leading-relaxed text-ink-800">
        {labels.synthesisInvite}
      </p>
    </div>
  );
}
