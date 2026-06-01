import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchQuestionnaire } from '../services/questionnaireService';
import { evaluateFormula, toNumericAnswers } from '../utils/formulaEvaluator';
import type {
  QuestionWithOptions,
  OptionWithDetails,
  HistoryEntry,
  QuestionnaireAnswer,
  LiveBudget,
  BudgetLineItem,
  BudgetCategory,
} from '../types/questionnaire';

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

// ── Helpers for loading saved budgets ────────────────────────────────────────

export function answersToHistory(answers: Record<string, string | number>): HistoryEntry[] {
  return Object.entries(answers).map(([questionIndex, answer]) => ({ questionIndex, answer }));
}

// ── Budget builder ─────────────────────────────────────────────────────────────

export function buildBudget(
  questions: QuestionWithOptions[],
  history: HistoryEntry[],
): LiveBudget {
  const answeredSet = new Map(history.map(e => [e.questionIndex, e.answer]));
  const numericAnswers = toNumericAnswers(Object.fromEntries(answeredSet));
  const lineItems: BudgetLineItem[] = [];
  const questionMap = new Map(questions.map(q => [q.index, q]));

  for (const { questionIndex, answer } of history) {
    const question = questionMap.get(questionIndex);
    if (!question) continue;

    if (question.type === 'multi_choice') {
      // answer is JSON array of selected values (e.g. '["v1","v2"]')
      let selected: string[] = [];
      try { selected = JSON.parse(String(answer)); } catch { selected = [String(answer)]; }
      for (const val of selected) {
        const opt = question.options.find(o => o.value === val);
        if (!opt?.budgetItem || !opt.costs.length) continue;
        const quantity = resolveQuantity(opt, numericAnswers);
        if (quantity <= 0) continue;
        const material  = costOf(opt, 'material')  * quantity;
        const labor     = costOf(opt, 'labor')     * quantity;
        const overhead  = costOf(opt, 'overhead')  * quantity;
        lineItems.push({
          optionId: opt.id, description: opt.budgetItem.description,
          category: opt.budgetItem.category, quantity,
          materialCost: material, laborCost: labor, overheadCost: overhead,
          totalCost: material + labor + overhead,
        });
      }
      continue;
    }

    // Only choice/boolean questions drive budget items
    if (question.type !== 'choice' && question.type !== 'boolean') continue;

    const selectedOption = question.options.find(o => o.value === String(answer));
    if (!selectedOption?.budgetItem || !selectedOption.costs.length) continue;

    const quantity = resolveQuantity(selectedOption, numericAnswers);
    if (quantity <= 0) continue;

    const material  = costOf(selectedOption, 'material')  * quantity;
    const labor     = costOf(selectedOption, 'labor')     * quantity;
    const overhead  = costOf(selectedOption, 'overhead')  * quantity;

    lineItems.push({
      optionId:     selectedOption.id,
      description:  selectedOption.budgetItem.description,
      category:     selectedOption.budgetItem.category,
      quantity,
      materialCost: material,
      laborCost:    labor,
      overheadCost: overhead,
      totalCost:    material + labor + overhead,
    });
  }

  // Group by category
  const catMap = new Map<string, BudgetLineItem[]>();
  for (const item of lineItems) {
    const list = catMap.get(item.category) ?? [];
    list.push(item);
    catMap.set(item.category, list);
  }

  const categories: BudgetCategory[] = [...catMap.entries()].map(([name, items]) => ({
    name,
    items,
    subtotal: items.reduce((s, i) => s + i.totalCost, 0),
  }));

  const totals = lineItems.reduce(
    (acc, i) => ({
      material: acc.material + i.materialCost,
      labor:    acc.labor    + i.laborCost,
      overhead: acc.overhead + i.overheadCost,
      grand:    acc.grand    + i.totalCost,
    }),
    { material: 0, labor: 0, overhead: 0, grand: 0 },
  );

  return { categories, totals };
}

function resolveQuantity(
  option: OptionWithDetails,
  numericAnswers: Record<string, number>,
): number {
  const rule = option.rules[0];
  if (!rule) return 1;
  if (rule.rule_type === 'fixed') return Number(rule.quantity_formula) || 1;
  if (rule.rule_type === 'formula' && rule.quantity_formula) {
    return evaluateFormula(rule.quantity_formula, numericAnswers);
  }
  return 1;
}

function costOf(
  option: OptionWithDetails,
  type: 'material' | 'labor' | 'overhead',
): number {
  return option.costs.find(c => c.cost_type === type)?.value ?? 0;
}

// ── Navigation helpers ────────────────────────────────────────────────────────

function nextQuestionIndex(
  current: QuestionWithOptions,
  selectedOption: OptionWithDetails | null,
  allQuestions: QuestionWithOptions[],
): string | null {
  // Option-driven skip logic (boolean / choice)
  if (selectedOption?.next_question_index) {
    return selectedOption.next_question_index;
  }

  // Explicit next on the question itself (numeric / text with diverging paths)
  if (current.next_question_index) {
    return current.next_question_index;
  }

  // Fallback: next sibling with the same parent, ordered by index
  const siblings = allQuestions
    .filter(q => q.parent_index === current.parent_index && compareIndex(q.index, current.index) > 0)
    .sort((a, b) => compareIndex(a.index, b.index));

  return siblings[0]?.index ?? null;
}

// ── Hook public interface ─────────────────────────────────────────────────────

export interface UseSupabaseQuestionnaireReturn {
  currentQuestion: QuestionWithOptions | null;
  /** Answers derived from history — keyed by question index */
  answers: Record<string, QuestionnaireAnswer>;
  budget: LiveBudget;
  /** 0–100 */
  progress: number;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  canGoBack: boolean;
  /** Call for boolean and choice questions */
  answerWithOption: (option: OptionWithDetails) => void;
  /** Call for multi_choice questions */
  answerMulti: (values: string[], options: OptionWithDetails[]) => void;
  /** Call for numeric questions */
  answerNumeric: (value: number) => void;
  /** Call for text questions */
  answerText: (value: string) => void;
  goBack: () => void;
  restart: () => void;
}

/**
 * Core hook for the Supabase-backed dynamic questionnaire.
 *
 * @param prefix - Optional question index prefix, e.g. '1' for all 1.x questions.
 *                 Pass undefined to load the entire questionnaire.
 */
export function useSupabaseQuestionnaire(
  prefix?: string,
): UseSupabaseQuestionnaireReturn {
  const [questions, setQuestions]     = useState<QuestionWithOptions[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<string | null>(null);
  const [isComplete, setIsComplete]   = useState(false);

  const questionMap = useMemo(
    () => new Map(questions.map(q => [q.index, q])),
    [questions],
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setHistory([]);
    setIsComplete(false);

    fetchQuestionnaire(prefix)
      .then(data => {
        setQuestions(data);
        setCurrentIndex(data[0]?.index ?? null);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, [prefix]);

  const currentQuestion = currentIndex ? (questionMap.get(currentIndex) ?? null) : null;

  const answers = useMemo(
    () => Object.fromEntries(history.map(e => [e.questionIndex, e.answer])),
    [history],
  );

  const budget = useMemo(() => buildBudget(questions, history), [questions, history]);

  const progress = useMemo(() => {
    if (isComplete) return 100;
    if (questions.length === 0) return 0;
    return Math.min(95, Math.round((history.length / questions.length) * 100));
  }, [isComplete, history.length, questions.length]);

  const advance = useCallback(
    (answer: QuestionnaireAnswer, option: OptionWithDetails | null) => {
      if (!currentQuestion) return;

      const entry: HistoryEntry = { questionIndex: currentQuestion.index, answer };
      setHistory(prev => [...prev, entry]);

      if (option?.is_final_answer) {
        setIsComplete(true);
        setCurrentIndex(null);
        return;
      }

      const next = nextQuestionIndex(currentQuestion, option, questions);
      if (!next) {
        setIsComplete(true);
        setCurrentIndex(null);
      } else {
        setCurrentIndex(next);
      }
    },
    [currentQuestion, questions],
  );

  const answerWithOption = useCallback(
    (option: OptionWithDetails) => advance(option.value, option),
    [advance],
  );

  const answerMulti = useCallback(
    (values: string[], _options: OptionWithDetails[]) => advance(JSON.stringify(values), null),
    [advance],
  );

  const answerNumeric = useCallback(
    (value: number) => advance(value, null),
    [advance],
  );

  const answerText = useCallback(
    (value: string) => advance(value, null),
    [advance],
  );

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setCurrentIndex(last.questionIndex);
      setIsComplete(false);
      return prev.slice(0, -1);
    });
  }, []);

  const restart = useCallback(() => {
    setHistory([]);
    setCurrentIndex(questions[0]?.index ?? null);
    setIsComplete(false);
  }, [questions]);

  return {
    currentQuestion,
    answers,
    budget,
    progress,
    isLoading,
    isComplete,
    error,
    canGoBack: history.length > 0,
    answerWithOption,
    answerMulti,
    answerNumeric,
    answerText,
    goBack,
    restart,
  };
}
