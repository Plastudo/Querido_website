import { supabase } from '../lib/supabase';
import type { Region } from '../types';
import type { ClientBudget, ClientBudgetWithDivisions } from '../types/questionnaire';

export interface DivisionToSave {
  workType: string; // corresponds to divisions.prefix
  answers: Record<string, string | number>;
}

export interface ClientBudgetSummary extends ClientBudget {
  division_labels: string[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function resolveDivisionIds(prefixes: string[]): Promise<Record<string, number>> {
  if (prefixes.length === 0) return {};
  const { data, error } = await supabase
    .from('divisions')
    .select('id, prefix')
    .in('prefix', prefixes);
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map(d => [d.prefix, d.id]));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchClientBudgets(): Promise<ClientBudgetSummary[]> {
  const { data, error } = await supabase
    .from('client_budgets')
    .select(`
      *,
      client_budget_divisions (
        divisions ( label )
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((b: any) => ({
    id: b.id,
    user_id: b.user_id,
    name: b.name,
    region: b.region,
    created_at: b.created_at,
    updated_at: b.updated_at,
    division_labels: (b.client_budget_divisions ?? [])
      .map((d: any) => d.divisions?.label)
      .filter(Boolean) as string[],
  }));
}

export async function createClientBudget(
  name: string,
  region: Region,
  divisions: DivisionToSave[],
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilizador não autenticado.');

  const prefixes = divisions.map(d => d.workType).filter(Boolean);
  const idMap = await resolveDivisionIds(prefixes);

  const { data: budget, error: budgetErr } = await supabase
    .from('client_budgets')
    .insert({ name, region, user_id: user.id })
    .select('id')
    .single();
  if (budgetErr) throw new Error(budgetErr.message);

  const divRows = divisions
    .filter(d => d.workType && idMap[d.workType] !== undefined)
    .map(d => ({
      budget_id:   budget.id,
      division_id: idMap[d.workType],
      answers:     d.answers,
    }));

  if (divRows.length > 0) {
    const { error: divErr } = await supabase
      .from('client_budget_divisions')
      .insert(divRows);
    if (divErr) throw new Error(divErr.message);
  }

  return budget.id;
}

export async function updateClientBudget(
  budgetId: string,
  divisions: DivisionToSave[],
): Promise<void> {
  const prefixes = divisions.map(d => d.workType).filter(Boolean);
  const idMap = await resolveDivisionIds(prefixes);

  const divRows = divisions
    .filter(d => d.workType && idMap[d.workType] !== undefined)
    .map(d => ({
      budget_id:   budgetId,
      division_id: idMap[d.workType],
      answers:     d.answers,
      saved_at:    new Date().toISOString(),
    }));

  if (divRows.length === 0) return;

  const { error } = await supabase
    .from('client_budget_divisions')
    .upsert(divRows, { onConflict: 'budget_id,division_id' });
  if (error) throw new Error(error.message);
}

export async function deleteClientBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('client_budgets')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchBudgetWithDivisions(
  budgetId: string,
): Promise<ClientBudgetWithDivisions | null> {
  const { data, error } = await supabase
    .from('client_budgets')
    .select(`
      *,
      client_budget_divisions (
        *,
        divisions ( prefix, label )
      )
    `)
    .eq('id', budgetId)
    .single();

  if (error) return null;
  return data as ClientBudgetWithDivisions;
}
