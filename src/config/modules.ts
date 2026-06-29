export type ModuleType = 'estimation' | 'concept-map' | 'positioning' | 'familiarity' | 'single';
export type Axis = 'langage' | 'diagnostic' | 'suivi' | 'explicabilite';

export interface ModuleOption { key: string }
export interface EstimationCfg { min: number; max: number; step: number; reference: number }
export interface ConceptMapCfg { items: { key: string }[]; categories: { key: string }[]; mapping: Record<string, string> }
export interface FamiliarityCfg { items: { key: string }[]; scale: number }

export interface ModuleDef {
  id: string;
  axis: Axis;
  type: ModuleType;
  options?: ModuleOption[];
  estimation?: EstimationCfg;
  conceptMap?: ConceptMapCfg;
  familiarity?: FamiliarityCfg;
}

export const COLD_START_THRESHOLD = 8;

export const MODULES: ModuleDef[] = [
  {
    id: 'situer-ia', axis: 'langage', type: 'concept-map',
    conceptMap: {
      items: [{ key: 'logigramme' }, { key: 'assistant' }, { key: 'foret' }, { key: 'cnn-irm' }, { key: 'calculatrice' }],
      categories: [{ key: 'regles' }, { key: 'apprentissage' }, { key: 'profond' }, { key: 'hors-ia' }],
      mapping: { logigramme: 'regles', assistant: 'profond', foret: 'apprentissage', 'cnn-irm': 'profond', calculatrice: 'hors-ia' },
    },
  },
  {
    id: 'familiarite', axis: 'langage', type: 'familiarity',
    familiarity: { items: [{ key: 'ml' }, { key: 'reseaux' }, { key: 'explicabilite' }, { key: 'langage' }], scale: 5 },
  },
  {
    id: 'delai-diagnostic', axis: 'diagnostic', type: 'estimation',
    estimation: { min: 0, max: 20, step: 1, reference: 9 },
  },
  {
    id: 'diagnostic-differentiel', axis: 'diagnostic', type: 'estimation',
    estimation: { min: 0, max: 100, step: 5, reference: 60 },
  },
  {
    id: 'intensification', axis: 'suivi', type: 'positioning',
  },
  {
    id: 'role-pharmacien', axis: 'suivi', type: 'single',
    options: [{ key: 'officine' }, { key: 'biologie' }, { key: 'recherche' }, { key: 'qualite' }],
  },
  {
    id: 'performance-fiabilite', axis: 'explicabilite', type: 'estimation',
    estimation: { min: 0, max: 100, step: 5, reference: 98 },
  },
  {
    id: 'boite-noire', axis: 'explicabilite', type: 'positioning',
  },
];

export function moduleById(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}
export function allModuleIds(): string[] {
  return MODULES.map((m) => m.id);
}
export function modulesByAxis(axis: Axis): ModuleDef[] {
  return MODULES.filter((m) => m.axis === axis);
}
