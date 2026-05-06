// ─── Enums ────────────────────────────────────────────────────────────────────

export type QuestionType = 'single_select' | 'multi_select' | 'number' | 'text';

export type BudgetCategory = 'material' | 'labor';

export type Unit = 'm2' | 'ml' | 'un' | 'hr' | 'vb';

export type Region = 'Norte' | 'Centro' | 'LisboaSul';

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PriceEntry {
  min: number;
  avg: number;
  max: number;
}

export type RegionalPrices = Record<Region, PriceEntry>;

// ─── Questions ────────────────────────────────────────────────────────────────

export interface QuestionOption {
  value: string;
  label: string;
}

/** Show this question only when the condition is met */
export interface QuestionCondition {
  /** ID of the question whose answer is being checked */
  questionId: string;
  /** The answer value(s) that must be present for this question to appear */
  values: string[];
}

/** Describes how a question contributes to a budget item */
export interface BudgetItemGenerator {
  /** ID of the BudgetItem template this question feeds into */
  budgetItemId: string;
  /** How the answer maps to quantity — 'direct' uses the answer as-is */
  mapping: 'direct' | 'lookup';
  /** Optional lookup table: answer value → quantity multiplier */
  lookupTable?: Record<string, number>;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  options?: QuestionOption[];        // required for single_select / multi_select
  conditions?: QuestionCondition[];  // if absent, always shown
  generates?: BudgetItemGenerator[]; // budget items this question drives
}

// ─── Questionnaire state ──────────────────────────────────────────────────────

export type Answers = Record<string, string | string[] | number>;

export interface QuestionnaireState {
  currentStep: number;
  answers: Answers;
  generatedBudgetItemIds: string[];
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  unit: Unit;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /** Fields the user is allowed to edit manually */
  editableFields: Array<'quantity' | 'unitPrice'>;
}

export interface BudgetSection {
  title: string;
  items: BudgetItem[];
}

export interface Budget {
  sections: BudgetSection[];
  totalPrice: number;
}
