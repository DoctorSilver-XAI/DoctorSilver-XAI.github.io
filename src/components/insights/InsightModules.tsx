import { useEffect, useMemo, useState } from 'react';
import type { Dict, Lang } from '@/i18n';
import { interpolate } from '@/i18n';
import { SITE } from '@/config/site';
import { MODULES, type Axis, type ModuleDef } from '@/config/modules';
import { hasSupabase } from '@/lib/supabaseClient';
import { fetchModuleCounts, subscribeModuleCounts, submitModuleResponse } from '@/lib/insights';
import type { ModuleAnswerCount } from '@/lib/insightsAggregation';
import ModuleSingleChoice from './modules/ModuleSingleChoice';
import ModuleEstimation from './modules/ModuleEstimation';
import ModulePositioning from './modules/ModulePositioning';
import ModuleFamiliarity from './modules/ModuleFamiliarity';
import ModuleConceptMap from './modules/ModuleConceptMap';
import SocialReveal from './SocialReveal';
import SynthesisRadar, { type AnswersByModule } from './SynthesisRadar';

interface Props {
  lang: Lang;
  t: Dict['insights'];
}

/** Rôle déclaré du répondant (anonyme si non précisé). */
type Role = 'jury' | 'proche' | 'curieux' | null;

/** Forme commune (superset) de la copy localisée d'un module. */
interface ModuleCopy {
  q: string;
  unit?: string;
  poleLeft?: string;
  poleRight?: string;
  options?: Record<string, string>;
  items?: Record<string, string>;
  categories?: Record<string, string>;
  reveal: string;
}

/** Met une première lettre en majuscule (pour la clé d'axe axisLangage, etc.). */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Libellé d'axe via les clés i18n axisLangage, axisDiagnostic, etc. */
function axisLabel(axis: Axis, t: Dict['insights']): string {
  const key = `axis${capitalize(axis)}` as keyof Dict['insights'];
  return (t[key] as string) ?? axis;
}

/** Une réponse est-elle complète et soumissible pour ce module ? */
function isReady(def: ModuleDef, draft: string[] | null): boolean {
  if (!draft) return false;
  switch (def.type) {
    case 'single':
      return draft.length > 0;
    case 'estimation':
    case 'positioning':
      return draft.length > 0;
    case 'familiarity':
      return draft.length >= (def.familiarity?.items.length ?? 0);
    case 'concept-map':
      return draft.length >= (def.conceptMap?.items.length ?? 0);
    default:
      return draft.length > 0;
  }
}

export default function InsightModules({ t }: Props) {
  const modules = useMemo<ModuleDef[]>(() => MODULES, []);
  const [counts, setCounts] = useState<ModuleAnswerCount[]>([]);

  // Écran d'identité (facultatif) puis parcours.
  const [started, setStarted] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [respondent, setRespondent] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // Réponses validées du participant, par identifiant de module (pour la synthèse).
  const [answers, setAnswers] = useState<AnswersByModule>({});

  // Lecture initiale des compteurs publics + abonnement temps réel.
  useEffect(() => {
    if (!hasSupabase) return;
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
  const isLast = index + 1 >= modules.length;
  const canSubmit = isReady(def, draft) && !revealed;

  function startWith(nextRole: Role, nextRespondent: string | null) {
    setRole(nextRole);
    setRespondent(nextRespondent);
    setStarted(true);
  }

  function renderView() {
    switch (def.type) {
      case 'single':
        return (
          <ModuleSingleChoice
            def={def}
            copy={{ q: copy.q, opt: copy.options ?? {} }}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'estimation':
        return (
          <ModuleEstimation
            def={def}
            copy={{ q: copy.q, unit: copy.unit }}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'positioning':
        return (
          <ModulePositioning
            def={def}
            copy={{ q: copy.q, poleLeft: copy.poleLeft ?? '', poleRight: copy.poleRight ?? '' }}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'familiarity':
        return (
          <ModuleFamiliarity
            def={def}
            copy={{ q: copy.q, items: copy.items ?? {} }}
            labels={t}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      case 'concept-map':
        return (
          <ModuleConceptMap
            def={def}
            copy={{ q: copy.q, items: copy.items ?? {}, categories: copy.categories ?? {} }}
            value={draft}
            disabled={revealed}
            onChange={(k) => setDraft(k)}
          />
        );
      default:
        return null;
    }
  }

  async function submit() {
    if (!canSubmit) return;
    const answerKeys = draft ?? [];
    setSubmitted(answerKeys);
    setAnswers((prev) => ({ ...prev, [def.id]: answerKeys }));
    if (hasSupabase) {
      try {
        await submitModuleResponse({
          moduleId: def.id,
          role,
          respondent: role === 'jury' ? respondent : null,
          answerKeys,
        });
      } catch {
        /* dégradation : on révèle quand même la pédagogie */
      }
    }
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    setDraft(null);
    setSubmitted([]);
    if (isLast) setDone(true);
    else setIndex(index + 1);
  }

  // Écran d'accueil avec identité optionnelle.
  if (!started) {
    return (
      <IdentityScreen
        t={t}
        onStart={startWith}
        role={role}
        respondent={respondent}
        setRole={setRole}
        setRespondent={setRespondent}
      />
    );
  }

  // Synthèse finale.
  if (done) {
    return (
      <SynthesisRadar answers={answers} counts={counts} hasSupabase={hasSupabase} labels={t} />
    );
  }

  return (
    <div className="instrument p-5 sm:p-8 md:p-10">
      {/* Progression */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider text-ink-500">
          <span>{axisLabel(def.axis, t)}</span>
          <span>{interpolate(t.progress, { n: index + 1, total: modules.length })}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-clinical-500 to-teal-500 transition-[width] duration-500"
            style={{ width: `${Math.round(((index + 1) / modules.length) * 100)}%` }}
          />
        </div>
      </div>

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
            {t.validate}
          </button>
          <p className="mt-3 text-xs text-ink-500">{t.noWrong}</p>
        </div>
      )}

      {/* Révélation à trois couches */}
      {revealed && (
        <>
          <SocialReveal
            def={def}
            copy={copy}
            labels={t}
            counts={counts}
            myAnswer={submitted}
            hasSupabase={hasSupabase}
          />
          <div className="mt-6 flex justify-end">
            <button type="button" className="btn btn-primary" onClick={next}>
              {isLast ? t.finish : t.next}
            </button>
          </div>
        </>
      )}

      {/* Bandeau confidentialité */}
      <p className="mt-6 text-xs leading-relaxed text-ink-500">{t.privacy}</p>
    </div>
  );
}

interface IdentityProps {
  t: Dict['insights'];
  role: Role;
  respondent: string | null;
  setRole: (r: Role) => void;
  setRespondent: (n: string | null) => void;
  onStart: (role: Role, respondent: string | null) => void;
}

/** Écran d'accueil : choix de rôle optionnel (anonyme par défaut). */
function IdentityScreen({ t, role, respondent, setRole, setRespondent, onStart }: IdentityProps) {
  const roleOptions: { value: Role; label: string }[] = [
    { value: null, label: t.roleAnon },
    { value: 'jury', label: t.roleJury },
    { value: 'proche', label: t.roleProche },
    { value: 'curieux', label: t.roleCurieux },
  ];
  // Le jury doit choisir son nom avant de commencer.
  const blocked = role === 'jury' && !respondent;

  return (
    <div className="instrument p-5 sm:p-8 md:p-10">
      <p className="font-display text-2xl text-ink-900">{t.identityTitle}</p>
      <p className="mt-3 max-w-md leading-relaxed text-ink-600">{t.identityLead}</p>

      <div className="seg mt-6 flex flex-wrap gap-2" role="group" aria-label={t.identityTitle}>
        {roleOptions.map((opt) => {
          const active = role === opt.value;
          return (
            <button
              key={opt.value ?? 'anon'}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setRole(opt.value);
                if (opt.value !== 'jury') setRespondent(null);
              }}
              className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Sélection du nom pour le jury. */}
      {role === 'jury' && (
        <div className="mt-5 max-w-sm">
          <label htmlFor="insight-respondent" className="mb-2 block text-sm font-medium text-ink-700">
            {t.jurySelect}
          </label>
          <select
            id="insight-respondent"
            className="field"
            value={respondent ?? ''}
            onChange={(e) => setRespondent(e.target.value || null)}
          >
            <option value="">{t.jurySelect}</option>
            {SITE.jury.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-7">
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto"
          aria-disabled={blocked}
          onClick={() => {
            if (blocked) return;
            onStart(role, respondent);
          }}
        >
          {t.start}
        </button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-500">{t.privacy}</p>
    </div>
  );
}
