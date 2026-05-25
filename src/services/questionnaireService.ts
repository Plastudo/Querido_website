import { supabase } from '../lib/supabase';
import type { QuestionWithOptions, OptionWithDetails } from '../types/questionnaire';

/**
 * Fetches all questions (with nested options, rules, costs, budget_items)
 * from Supabase. Pass `prefix` to filter by question index prefix, e.g. '1'
 * fetches '1.1', '1.1.1', etc.
 */
function compareIndex(a: string, b: string): number {
  const ap = a.split('.').map(Number);
  const bp = b.split('.').map(Number);
  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
    const ai = ap[i] ?? -1;
    const bi = bp[i] ?? -1;
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

export async function fetchQuestionnaire(prefix?: string): Promise<QuestionWithOptions[]> {
  let query = supabase
    .from('questions')
    .select(`
      *,
      options (
        *,
        question_rules (*),
        costs (*),
        budget_items (*)
      )
    `);

  if (prefix) {
    query = query.or(`index.eq.${prefix},index.like.${prefix}.%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data) return [];

  return (data as any[]).map(q => ({
    ...q,
    options: ((q.options ?? []) as any[])
      .sort((a, b) => a.order_index - b.order_index)
      .map(o => ({
        ...o,
        rules: o.question_rules ?? [],
        costs: o.costs ?? [],
        budgetItem: (o.budget_items ?? [])[0] ?? null,
      } satisfies OptionWithDetails)),
  } satisfies QuestionWithOptions)).sort((a, b) => compareIndex(a.index, b.index));
}
