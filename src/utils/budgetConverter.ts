import type { LiveBudget } from '../types/questionnaire';
import type { Budget, BudgetItem, BudgetSection } from '../types';

export function liveBudgetToProjectBudget(live: LiveBudget): Budget {
  const sections: BudgetSection[] = live.categories.map(cat => ({
    title: cat.name,
    items: cat.items.map(item => {
      const unitPrice = item.quantity > 0 ? item.totalCost / item.quantity : item.totalCost;
      return {
        id: String(item.optionId),
        category: 'material' as const,
        name: item.description,
        unit: 'vb' as const,
        quantity: Math.round(item.quantity * 10) / 10,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(item.totalCost * 100) / 100,
        editableFields: ['quantity', 'unitPrice'] as Array<'quantity' | 'unitPrice'>,
      } satisfies BudgetItem;
    }),
  }));

  return {
    sections,
    totalPrice: Math.round(live.totals.grand * 100) / 100,
  };
}
