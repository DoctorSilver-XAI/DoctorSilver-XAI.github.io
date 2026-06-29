import { supabase } from './supabaseClient';
import type { ModuleAnswerCount } from './insightsAggregation';

export interface ModuleResponseInput {
  moduleId: string;
  context: 'public' | 'jury';
  respondent?: string | null;
  answerKeys: string[];
  answerText?: string | null;
}
export interface AdminModuleResponse {
  respondent: string | null;
  module_id: string;
  answer_keys: string[];
  answer_text: string | null;
  created_at: string;
}

export async function fetchModuleCounts(): Promise<ModuleAnswerCount[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('module_answer_counts')
    .select('module_id, answer_key, n');
  if (error) throw error;
  return (data ?? []) as ModuleAnswerCount[];
}

export function subscribeModuleCounts(onChange: (row: ModuleAnswerCount) => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('rt-module-counts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'module_answer_counts' }, (payload) => {
      const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
      if (row) onChange(row as ModuleAnswerCount);
    })
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

export async function submitModuleResponse(input: ModuleResponseInput): Promise<void> {
  if (!supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('module_responses').insert({
    module_id: input.moduleId,
    context: input.context,
    respondent: input.respondent ?? null,
    answer_keys: input.answerKeys,
    answer_text: input.answerText ?? null,
  });
  if (error) throw error;
}

export async function hasJuryAnsweredModule(nom: string, moduleId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('jury_answered_module', { p_nom: nom, p_module_id: moduleId });
  if (error) throw error;
  return Boolean(data);
}

export async function fetchAdminModuleResponses(password: string): Promise<AdminModuleResponse[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('admin_module_responses', { p_password: password });
  if (error) throw error;
  return (data ?? []) as AdminModuleResponse[];
}
