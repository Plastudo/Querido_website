// ── DB row types (mirror Supabase schema exactly) ─────────────────────────────

export interface DBQuestion {
  id: number;
  index: string;
  text: string;
  type: 'boolean' | 'numeric' | 'choice' | 'text';
  required: boolean;
  help_text: string | null;
  order_index: number;
  parent_index: string | null;
  next_question_index: string | null;
}

export interface DBOption {
  id: number;
  question_id: number;
  value: string;
  label: string;
  next_question_index: string | null;
  is_final_answer: boolean;
  order_index: number;
}

export interface DBQuestionRule {
  id: number;
  option_id: number;
  rule_type: 'fixed' | 'formula' | 'conditional';
  quantity_formula: string | null;
  description: string | null;
}

export interface DBCost {
  id: number;
  option_id: number;
  cost_type: 'material' | 'labor' | 'overhead';
  value: number;
  description: string | null;
}

export interface DBBudgetItem {
  id: number;
  option_id: number;
  description: string;
  category: string;
  order_index: number;
}

// ── Enriched types (composed in service layer) ────────────────────────────────

export interface OptionWithDetails extends DBOption {
  rules: DBQuestionRule[];
  costs: DBCost[];
  budgetItem: DBBudgetItem | null;
}

export interface QuestionWithOptions extends DBQuestion {
  options: OptionWithDetails[];
}

// ── Questionnaire runtime ─────────────────────────────────────────────────────

export type QuestionnaireAnswer = string | number;

export interface HistoryEntry {
  questionIndex: string;
  answer: QuestionnaireAnswer;
}

// ── Budget output ─────────────────────────────────────────────────────────────

export interface BudgetLineItem {
  optionId: number;
  description: string;
  category: string;
  quantity: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
}

export interface BudgetCategory {
  name: string;
  items: BudgetLineItem[];
  subtotal: number;
}

export interface LiveBudget {
  categories: BudgetCategory[];
  totals: {
    material: number;
    labor: number;
    overhead: number;
    grand: number;
  };
}
