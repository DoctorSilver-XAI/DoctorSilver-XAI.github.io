import type { Dict } from '@/i18n';
import { interpolate } from '@/i18n';
import { COLD_START_THRESHOLD, type ModuleDef } from '@/config/modules';
import {
  distribution,
  histogram,
  majorityBin,
  sliderAverage,
  totalForModule,
  type ModuleAnswerCount,
} from '@/lib/insightsAggregation';

/**
 * Forme commune (superset) de la copy localisée d'un module, telle que produite
 * par t.insights.modules[def.id]. On ne lit ici que les champs pertinents pour
 * la couche d'éclairage (reveal) et les libellés d'options.
 */
interface ModuleCopy {
  reveal: string;
  options?: Record<string, string>;
  poleLeft?: string;
  poleRight?: string;
  unit?: string;
}

interface Props {
  def: ModuleDef;
  copy: ModuleCopy;
  labels: Dict['insights'];
  counts: ModuleAnswerCount[];
  /** Réponse du participant (answer_keys), telle que soumise. */
  myAnswer: string[];
  hasSupabase: boolean;
}

/** Nombre de tranches visé pour l'histogramme d'une estimation. */
const TARGET_BINS = 10;

/**
 * Révélation à trois couches pour un module.
 *
 * Couche 1 (toujours visible) : l'éclairage des études (copy.reveal), suivi
 * d'une invitation à approfondir lors de la soutenance (labels.revealMore).
 *
 * Couche 2 (collectif) : seulement si Supabase est configuré et qu'un seuil de
 * démarrage à froid est franchi (COLD_START_THRESHOLD), pour ne pas exposer un
 * agrégat trop maigre qui pourrait dé-anonymiser les premiers répondants.
 *   - estimation : histogramme SVG sobre, tranche du participant en teal,
 *     repère vertical à la valeur de référence des études.
 *   - positioning : position moyenne du collectif sur l'axe.
 *   - single : répartition par option.
 * Un cadrage d'appartenance (labels.joinMajority) ou de singularité
 * (labels.standOut) accompagne la réponse, selon qu'elle tombe ou non dans la
 * tranche / l'option majoritaire.
 *
 * En l'absence de Supabase, on affiche labels.demoNotice et aucune couche sociale.
 */
export default function SocialReveal({ def, copy, labels, counts, myAnswer, hasSupabase }: Props) {
  const total = hasSupabase ? totalForModule(counts, def.id) : 0;
  const coldStart = total < COLD_START_THRESHOLD;
  const showSocial = hasSupabase && !coldStart;
  // Seuls ces types portent une représentation sociale par module. La familiarité
  // est restituée dans la synthèse finale, le concept-map n'a pas de couche sociale.
  const hasSocialLayer =
    def.type === 'estimation' || def.type === 'positioning' || def.type === 'single';

  return (
    <div
      className="reveal-card rounded-2xl border border-teal-500/40 bg-teal-50/70 p-5 sm:p-6"
      data-testid="insight-reveal"
      role="status"
      aria-live="polite"
    >
      {/* Couche études, toujours visible */}
      <p className="font-mono text-xs uppercase tracking-wider text-teal-700">{labels.evidence}</p>
      <p className="mt-2 leading-relaxed text-ink-800">{copy.reveal}</p>
      <p className="mt-2 text-sm italic text-ink-500">{labels.revealMore}</p>

      {/* Couche collectif */}
      {!hasSupabase ? (
        <p className="mt-5 rounded-xl border border-clinical-400/35 bg-white/70 p-3 text-sm text-ink-600">
          {labels.demoNotice}
        </p>
      ) : coldStart ? (
        <p className="mt-5 text-sm text-ink-500">{labels.firstContributor}</p>
      ) : hasSocialLayer ? (
        <div className="mt-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
            {labels.collective}
          </p>
          <div className="mt-3">
            {renderSocialLayer({ def, copy, labels, counts, myAnswer })}
          </div>
        </div>
      ) : null}

      {/* Compteur de participation */}
      {showSocial && (
        <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider text-ink-400">
          {interpolate(labels.sharedCount, { n: total })}
        </p>
      )}
    </div>
  );
}

interface LayerProps {
  def: ModuleDef;
  copy: ModuleCopy;
  labels: Dict['insights'];
  counts: ModuleAnswerCount[];
  myAnswer: string[];
}

/** Aiguille vers le rendu social adapté au type de module. */
function renderSocialLayer(props: LayerProps) {
  switch (props.def.type) {
    case 'estimation':
      return <EstimationHistogram {...props} />;
    case 'positioning':
      return <PositioningAverage {...props} />;
    case 'single':
      return <SingleDistribution {...props} />;
    default:
      // familiarity et concept-map ne portent pas de couche sociale par module
      // (la familiarité est restituée en synthèse, hors de cette révélation).
      return null;
  }
}

/** Cadrage appartenance / singularité, partagé par les rendus sociaux. */
function FramingNote({ joined, labels }: { joined: boolean; labels: Dict['insights'] }) {
  return (
    <p className={`mt-3 text-sm ${joined ? 'text-teal-700' : 'text-ink-700'}`}>
      {joined ? labels.joinMajority : labels.standOut}
    </p>
  );
}

/**
 * Histogramme SVG sobre pour une estimation.
 * Barres grises, tranche du participant en teal, repère vertical à la valeur de
 * référence des études. Rendu calqué sur l'aperçu validé (barres alignées en
 * bas, repère études en trait, étiquettes sobres aux extrémités).
 */
function EstimationHistogram({ def, copy, labels, counts, myAnswer }: LayerProps) {
  const cfg = def.estimation;
  if (!cfg) return null;

  const span = cfg.max - cfg.min;
  const rawBin = span / TARGET_BINS;
  // Tranche au moins égale au pas, arrondie à un entier propre.
  const binSize = Math.max(cfg.step, Math.round(rawBin) || cfg.step);
  const bins = histogram(counts, def.id, { min: cfg.min, max: cfg.max, binSize });
  const maxN = bins.reduce((m, b) => Math.max(m, b.n), 0) || 1;
  const top = majorityBin(bins);

  const myValue = myAnswer.length ? Number(myAnswer[0]) : NaN;
  const myBinIdx = Number.isNaN(myValue)
    ? -1
    : Math.min(bins.length - 1, Math.max(0, Math.floor((myValue - cfg.min) / binSize)));
  const joined =
    top != null && myBinIdx >= 0 && bins[myBinIdx]?.start === top.start && bins[myBinIdx]?.end === top.end;

  // Géométrie SVG.
  const W = 320;
  const H = 132;
  const padBottom = 18;
  const plotH = H - padBottom;
  const gap = 3;
  const barW = (W - gap * (bins.length - 1)) / bins.length;
  const refX =
    span > 0 ? Math.min(W, Math.max(0, ((cfg.reference - cfg.min) / span) * W)) : 0;
  const unit = copy.unit ? ` ${copy.unit}` : '';

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${labels.collective} : ${labels.evidence} ${cfg.reference}${unit}`}
      >
        {bins.map((b, i) => {
          const h = (b.n / maxN) * (plotH - 4);
          const x = i * (barW + gap);
          const y = plotH - h;
          const mine = i === myBinIdx;
          return (
            <rect
              key={b.start}
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, b.n > 0 ? 2 : 0)}
              rx={2}
              fill={mine ? 'var(--reveal-bar-me, #19A2B0)' : 'var(--reveal-bar, #cbd5e6)'}
            />
          );
        })}

        {/* Repère vertical : valeur de référence des études. */}
        <line
          x1={refX}
          x2={refX}
          y1={0}
          y2={plotH}
          stroke="var(--reveal-ref, #234A8C)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text x={refX} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--reveal-ref, #234A8C)">
          {labels.evidence} {cfg.reference}
          {unit}
        </text>
      </svg>

      {/* Étiquettes sobres aux extrémités de l'axe. */}
      <div className="mt-1 flex justify-between font-mono text-[0.65rem] uppercase tracking-wider text-ink-400">
        <span>
          {cfg.min}
          {unit}
        </span>
        <span>
          {cfg.max}
          {unit}
        </span>
      </div>

      <FramingNote joined={joined} labels={labels} />
    </div>
  );
}

/**
 * Position moyenne du collectif pour un module de positionnement.
 * Les buckets stockés vont de 0 à 10 ; on les ramène à un pourcentage d'axe.
 */
function PositioningAverage({ def, copy, labels, counts, myAnswer }: LayerProps) {
  const avg = sliderAverage(counts, def.id); // 0..10
  const avgPct = avg != null ? Math.min(100, Math.max(0, avg * 10)) : null;
  const myBucket = myAnswer.length ? Number(myAnswer[0]) : NaN;
  const myPct = Number.isNaN(myBucket) ? null : Math.min(100, Math.max(0, myBucket * 10));
  // « Rejoint la majorité » : à moins de 15 points de la moyenne du collectif.
  const joined = avgPct != null && myPct != null && Math.abs(avgPct - myPct) <= 15;

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-wider text-ink-500">
        <span>{copy.poleLeft ?? ''}</span>
        <span>{copy.poleRight ?? ''}</span>
      </div>
      <div className="relative mt-2 h-2 w-full rounded-full bg-line">
        {myPct != null && (
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-clinical-500 shadow"
            style={{ left: `${myPct}%` }}
            aria-hidden="true"
          />
        )}
        {avgPct != null && (
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-500 shadow"
            style={{ left: `${avgPct}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-2 flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-teal-700">
          <span className="h-2 w-2 rounded-full bg-teal-500" />
          {labels.collective}
        </span>
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="h-2 w-2 rounded-full bg-clinical-500" />
          {labels.youAnswered}
        </span>
      </div>

      <FramingNote joined={joined} labels={labels} />
    </div>
  );
}

/**
 * Répartition par option pour un module de choix unique.
 * Barres horizontales, option du participant en teal, le reste en clinique.
 */
function SingleDistribution({ def, copy, labels, counts, myAnswer }: LayerProps) {
  const optionKeys = (def.options ?? []).map((o) => o.key);
  const shares = distribution(counts, def.id, optionKeys);
  const mine = myAnswer[0] ?? null;
  // Option la plus choisie par le collectif.
  const top = shares.reduce<typeof shares[number] | null>(
    (best, s) => (s.n > 0 && (!best || s.n > best.n) ? s : best),
    null,
  );
  const joined = top != null && mine != null && mine === top.key;

  function optLabel(key: string): string {
    return copy.options?.[key] ?? key;
  }

  return (
    <div>
      <ul className="space-y-2.5">
        {shares.map((s) => {
          const isMine = s.key === mine;
          return (
            <li key={s.key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className={isMine ? 'font-semibold text-teal-700' : 'text-ink-700'}>
                  {optLabel(s.key)}
                </span>
                <span className="font-mono text-xs text-ink-500">{s.pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full ${
                    isMine
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

      <FramingNote joined={joined} labels={labels} />
    </div>
  );
}
