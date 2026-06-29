export type ModuleType = 'single' | 'multi' | 'truefalse' | 'estimate' | 'slider' | 'sliders' | 'open';
export interface ModuleOption { key: string }
export interface ModuleSliderItem { key: string }
export interface ModuleDef {
  id: string;
  type: ModuleType;
  act: 1 | 2 | 3 | 4;
  onHome: boolean;
  optional?: boolean;
  options?: ModuleOption[];
  items?: ModuleSliderItem[];
  correctKey?: string;
  sliderMax?: number;
}

export const MODULES: ModuleDef[] = [
  // Acte 1 — Vos repères
  { id: 'interet-global', type: 'multi', act: 1, onHome: false,
    options: [{ key: 'methodes-xai' }, { key: 'clinique' }, { key: 'paradigme' }, { key: 'ethique-societe' }, { key: 'pharmacien' }, { key: 'medico-eco' }] },
  { id: 'familiarite-ia', type: 'sliders', act: 1, onHome: false,
    items: [{ key: 'ml' }, { key: 'reseaux' }, { key: 'shap' }, { key: 'nlp' }, { key: 'pgx' }] },
  // Acte 2 — Ce que l'IA sait déjà faire
  { id: 'pepite-arn', type: 'estimate', act: 2, onHome: true, correctKey: 'c',
    options: [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }] },
  { id: 'promesse-bipolaire', type: 'estimate', act: 2, onHome: false, correctKey: 'c',
    options: [{ key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'd' }] },
  { id: 'pepite-polypharmacie', type: 'truefalse', act: 2, onHome: false, correctKey: 'faux',
    options: [{ key: 'vrai' }, { key: 'faux' }] },
  // Acte 3 — L'explicabilité, condition de la confiance
  { id: 'xai-verrou', type: 'single', act: 3, onHome: true,
    options: [{ key: 'performance' }, { key: 'explicabilite' }, { key: 'cout' }, { key: 'reglementation' }] },
  { id: 'pepite-auc', type: 'truefalse', act: 3, onHome: false, correctKey: 'vrai',
    options: [{ key: 'vrai' }, { key: 'faux' }] },
  // Acte 4 — Quelle médecine, quelle société — et quel rôle pour le pharmacien
  { id: 'opinion-aug-sub', type: 'slider', act: 4, onHome: false, sliderMax: 100 },
  { id: 'enjeux-humain', type: 'single', act: 4, onHome: true,
    options: [{ key: 'attention' }, { key: 'autonomie' }, { key: 'inegalites' }, { key: 'deshumanisation' }, { key: 'surveillance' }] },
  { id: 'pharmacien-pivot', type: 'single', act: 4, onHome: true,
    options: [{ key: 'officine' }, { key: 'biologie' }, { key: 'rd-industrie' }, { key: 'reglementation-qualite' }] },
  { id: 'attente-vision', type: 'open', act: 4, onHome: false, optional: true },
];

export function juryModules(): ModuleDef[] {
  return [...MODULES].sort((a, b) => a.act - b.act);
}
export function homeModules(): ModuleDef[] {
  return MODULES.filter((m) => m.onHome);
}
export function moduleById(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}
export function allModuleIds(): string[] {
  return MODULES.map((m) => m.id);
}
