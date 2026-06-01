import { supabase } from '../lib/supabase';
import type { Division } from '../hooks/useDivisions';

export type { Division };
export type DivisionInput = Omit<Division, 'id'>;

// ── Division CRUD ──────────────────────────────────────────────────────────────

export async function fetchAllDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('*')
    .order('order_index');
  if (error) throw new Error(error.message);
  return (data ?? []) as Division[];
}

export async function createDivision(input: DivisionInput): Promise<Division> {
  const { data, error } = await supabase
    .from('divisions').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Division;
}

export async function updateDivision(id: number, input: Partial<DivisionInput>): Promise<Division> {
  const { data, error } = await supabase
    .from('divisions').update(input).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Division;
}

export async function deleteDivision(id: number): Promise<void> {
  const { error } = await supabase.from('divisions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Index sort (version-style: "1.1" < "1.1.1" < "1.2") ──────────────────────

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

// ── Admin question types ───────────────────────────────────────────────────────

export interface AdminCosts {
  material: number;
  labor: number;
  overhead: number;
}

export interface AdminOption {
  id?: number;
  question_id?: number;
  value: string;
  label: string;
  next_question_index: string;
  is_final_answer: boolean;
  order_index: number;
  costs: AdminCosts;
  quantity_formula: string;
  budget_description: string;
  budget_category: string;
  is_addon: boolean;
  addon_info: string;
}

export interface AdminQuestion {
  id?: number;
  index: string;
  text: string;
  type: 'boolean' | 'numeric' | 'choice' | 'multi_choice' | 'text';
  required: boolean;
  help_text: string;
  unit: string;
  order_index: number;
  parent_index: string;
  next_question_index: string;
  options: AdminOption[];
}

// ── Question fetch ─────────────────────────────────────────────────────────────

export async function fetchAdminQuestions(prefix: string): Promise<AdminQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, index, text, type, required, help_text, unit, order_index, parent_index, next_question_index,
      options (
        id, value, label, next_question_index, is_final_answer, order_index, is_addon, addon_info,
        question_rules ( rule_type, quantity_formula ),
        costs ( cost_type, value ),
        budget_items ( description, category, order_index )
      )
    `)
    .like('index', `${prefix}.%`);

  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((q: any): AdminQuestion => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: AdminOption[] = (q.options ?? []).map((o: any): AdminOption => {
      const costs: AdminCosts = { material: 0, labor: 0, overhead: 0 };
      for (const c of o.costs ?? []) {
        costs[c.cost_type as keyof AdminCosts] = Number(c.value);
      }
      const rule = o.question_rules?.[0];
      const bi   = o.budget_items?.[0];
      return {
        id:                   o.id,
        question_id:          q.id,
        value:                o.value ?? '',
        label:                o.label ?? '',
        next_question_index:  o.next_question_index ?? '',
        is_final_answer:      o.is_final_answer ?? false,
        order_index:          o.order_index ?? 0,
        costs,
        quantity_formula:     rule?.quantity_formula ?? '',
        budget_description:   bi?.description ?? '',
        budget_category:      bi?.category ?? '',
        is_addon:             o.is_addon ?? false,
        addon_info:           o.addon_info ?? '',
      };
    }).sort((a: AdminOption, b: AdminOption) => a.order_index - b.order_index);

    return {
      id:                   q.id,
      index:                q.index,
      text:                 q.text,
      type:                 q.type,
      required:             q.required,
      help_text:            q.help_text ?? '',
      unit:                 q.unit ?? '',
      order_index:          q.order_index ?? 0,
      parent_index:         q.parent_index ?? '',
      next_question_index:  q.next_question_index ?? '',
      options,
    };
  }).sort((a, b) => compareIndex(a.index, b.index));
}

// ── Question save ──────────────────────────────────────────────────────────────

export async function saveQuestion(
  q: AdminQuestion,
  deletedOptionIds: number[],
): Promise<void> {
  const qPayload = {
    index:               q.index,
    text:                q.text,
    type:                q.type,
    required:            q.required,
    help_text:           q.help_text || null,
    unit:                q.unit || null,
    order_index:         q.order_index,
    parent_index:        q.parent_index || null,
    next_question_index: q.next_question_index || null,
  };

  let questionId: number;
  if (q.id) {
    const { error } = await supabase.from('questions').update(qPayload).eq('id', q.id);
    if (error) throw new Error(error.message);
    questionId = q.id;
  } else {
    const { data, error } = await supabase.from('questions').insert(qPayload).select('id').single();
    if (error) throw new Error(error.message);
    questionId = data.id;
  }

  // Delete removed options (cascade clears rules/costs/budget_items)
  if (deletedOptionIds.length > 0) {
    const { error } = await supabase.from('options').delete().in('id', deletedOptionIds);
    if (error) throw new Error(error.message);
  }

  for (const opt of q.options) {
    const optPayload = {
      question_id:         questionId,
      value:               opt.value,
      label:               opt.label,
      next_question_index: opt.next_question_index || null,
      is_final_answer:     opt.is_final_answer,
      order_index:         opt.order_index,
      is_addon:            opt.is_addon,
      addon_info:          opt.addon_info || null,
    };

    let optionId: number;
    if (opt.id) {
      const { error } = await supabase.from('options').update(optPayload).eq('id', opt.id);
      if (error) throw new Error(error.message);
      optionId = opt.id;
    } else {
      const { data, error } = await supabase.from('options').insert(optPayload).select('id').single();
      if (error) throw new Error(error.message);
      optionId = data.id;
    }

    // Replace costs
    await supabase.from('costs').delete().eq('option_id', optionId);
    const costsPayload = [];
    if (opt.costs.material > 0)  costsPayload.push({ option_id: optionId, cost_type: 'material',  value: opt.costs.material });
    if (opt.costs.labor > 0)     costsPayload.push({ option_id: optionId, cost_type: 'labor',     value: opt.costs.labor });
    if (opt.costs.overhead > 0)  costsPayload.push({ option_id: optionId, cost_type: 'overhead',  value: opt.costs.overhead });
    if (costsPayload.length > 0) {
      const { error } = await supabase.from('costs').insert(costsPayload);
      if (error) throw new Error(error.message);
    }

    // Replace rule
    await supabase.from('question_rules').delete().eq('option_id', optionId);
    const hasCosts = opt.costs.material > 0 || opt.costs.labor > 0 || opt.costs.overhead > 0;
    if (opt.quantity_formula) {
      const { error } = await supabase.from('question_rules').insert({
        option_id: optionId, rule_type: 'formula', quantity_formula: opt.quantity_formula,
      });
      if (error) throw new Error(error.message);
    } else if (hasCosts) {
      const { error } = await supabase.from('question_rules').insert({
        option_id: optionId, rule_type: 'fixed', quantity_formula: '1',
      });
      if (error) throw new Error(error.message);
    }

    // Replace budget item
    await supabase.from('budget_items').delete().eq('option_id', optionId);
    if (opt.budget_description) {
      const { error } = await supabase.from('budget_items').insert({
        option_id: optionId, description: opt.budget_description,
        category: opt.budget_category || 'Geral', order_index: opt.order_index,
      });
      if (error) throw new Error(error.message);
    }
  }
}

// ── Question delete ────────────────────────────────────────────────────────────

export async function deleteQuestion(id: number): Promise<void> {
  // CASCADE on FK handles options → rules/costs/budget_items
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
