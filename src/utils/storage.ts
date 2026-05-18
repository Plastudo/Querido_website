import type { Project } from '../types';

export interface SavedBudget {
  id: string;
  savedAt: string; // ISO 8601
  title: string;
  project: Project;
  grandTotal: number;
}

const KEY = 'querido_budgets';

// Notifica outros componentes na mesma tab após escrita
function notify() {
  window.dispatchEvent(new Event('querido:budgets-updated'));
}

export function getSavedBudgets(): SavedBudget[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveBudget(project: Project, title: string, grandTotal: number): SavedBudget {
  const entry: SavedBudget = {
    id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
    title,
    project,
    grandTotal,
  };
  localStorage.setItem(KEY, JSON.stringify([entry, ...getSavedBudgets()]));
  notify();
  return entry;
}

export function updateBudget(id: string, project: Project, title: string, grandTotal: number): void {
  const budgets = getSavedBudgets().map(b =>
    b.id === id
      ? { ...b, project, title, grandTotal, savedAt: new Date().toISOString() }
      : b
  );
  localStorage.setItem(KEY, JSON.stringify(budgets));
  notify();
}

export function deleteBudget(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getSavedBudgets().filter(b => b.id !== id)));
  notify();
}
