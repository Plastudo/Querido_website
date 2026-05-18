import { useState, useEffect, useMemo } from 'react';
import type {
  Question,
  Answers,
  Budget,
  BudgetItem,
  BudgetCategory,
  Unit,
} from '../types';

// ─── Questionnaire JSON shape ─────────────────────────────────────────────────

interface BudgetItemTemplate {
  category: BudgetCategory;
  name: string;
  unit: Unit;
  unitPrice: number;
  editableFields: Array<'quantity' | 'unitPrice'>;
}

interface SectionTemplate {
  title: string;
  itemIds: string[];
}

interface QuestionnaireData {
  workType: string;
  questions: Question[];
  budgetItemTemplates: Record<string, BudgetItemTemplate>;
  sections: SectionTemplate[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when all conditions for a question are satisfied. */
function isVisible(question: Question, answers: Answers): boolean {
  if (!question.conditions || question.conditions.length === 0) return true;

  return question.conditions.every(condition => {
    const answer = answers[condition.questionId];
    if (answer === undefined || answer === null) return false;

    const answerValues = Array.isArray(answer)
      ? answer
      : [String(answer)];

    return condition.values.some(v => answerValues.includes(v));
  });
}

/** Resolves a single generator entry into a quantity. */
function resolveQuantity(
  answer: string | string[] | number,
  mapping: 'direct' | 'lookup',
  lookupTable?: Record<string, number>,
): number {
  if (mapping === 'direct') {
    const qty = Number(answer);
    return isNaN(qty) ? 0 : qty;
  }

  // lookup: answer value (or first value for multi_select) maps to a multiplier
  const key = Array.isArray(answer) ? answer[0] : String(answer);
  return lookupTable?.[key] ?? 0;
}

/** Builds a full Budget from the current answers and questionnaire data. */
function generateBudget(data: QuestionnaireData, answers: Answers): Budget {
  // Collect all generated items keyed by budgetItemId
  const itemMap = new Map<string, BudgetItem>();

  for (const question of data.questions) {
    if (!question.generates) continue;
    const answer = answers[question.id];
    if (answer === undefined || answer === null || answer === '') continue;

    for (const gen of question.generates) {
      const template = data.budgetItemTemplates[gen.budgetItemId];
      if (!template) continue;

      const quantity = resolveQuantity(answer, gen.mapping, gen.lookupTable);
      if (quantity <= 0) continue;

      const existing = itemMap.get(gen.budgetItemId);
      const finalQuantity = existing ? existing.quantity + quantity : quantity;
      const totalPrice = finalQuantity * template.unitPrice;

      itemMap.set(gen.budgetItemId, {
        id: gen.budgetItemId,
        category: template.category,
        name: template.name,
        unit: template.unit,
        quantity: finalQuantity,
        unitPrice: template.unitPrice,
        totalPrice,
        editableFields: template.editableFields,
      });
    }
  }

  // Organise into sections, preserving the order defined in the JSON
  let budgetTotal = 0;

  const sections = data.sections
    .map(section => {
      const items = section.itemIds
        .map(id => itemMap.get(id))
        .filter((item): item is BudgetItem => item !== undefined);
      return { title: section.title, items };
    })
    .filter(section => section.items.length > 0);

  // Also pick up any items not assigned to a named section
  const assignedIds = new Set(data.sections.flatMap(s => s.itemIds));
  const orphanItems = [...itemMap.values()].filter(i => !assignedIds.has(i.id));
  if (orphanItems.length > 0) {
    sections.push({ title: 'Outros', items: orphanItems });
  }

  for (const section of sections) {
    for (const item of section.items) {
      budgetTotal += item.totalPrice;
    }
  }

  return { sections, totalPrice: budgetTotal };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseQuestionnaireReturn {
  currentQuestion: Question | null;
  answers: Answers;
  /** 0–100 */
  progress: number;
  currentStep: number;
  totalSteps: number;
  goNext: (answer: string | string[] | number) => void;
  goBack: () => void;
  isComplete: boolean;
  isLoading: boolean;
  generatedBudget: Budget | null;
}

export function useQuestionnaire(workType: string): UseQuestionnaireReturn {
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load the questionnaire JSON for the selected work type
  useEffect(() => {
    setData(null);
    setAnswers({});
    setCurrentIndex(0);

    import(`../data/questionnaires/${workType}.json`)
      .then((mod: { default: QuestionnaireData }) => setData(mod.default))
      .catch(() => {
        console.error(`[useQuestionnaire] No questionnaire found for: ${workType}`);
      });
  }, [workType]);

  // Filter questions whose conditions are satisfied given current answers
  const visibleQuestions = useMemo<Question[]>(() => {
    if (!data) return [];
    return data.questions.filter(q => isVisible(q, answers));
  }, [data, answers]);

  const currentQuestion = visibleQuestions[currentIndex] ?? null;

  const isComplete = data !== null && currentIndex >= visibleQuestions.length;

  // Progress counts answered steps, not the cursor position, so it feels
  // natural: 0 % at the start, 100 % only when every visible question is done.
  const progress = useMemo(() => {
    const total = visibleQuestions.length;
    if (total === 0) return 0;
    return Math.min(100, Math.round((currentIndex / total) * 100));
  }, [currentIndex, visibleQuestions.length]);

  const generatedBudget = useMemo<Budget | null>(() => {
    if (!data) return null;
    return generateBudget(data, answers);
  }, [data, answers]);

  function goNext(answer: string | string[] | number) {
    if (!currentQuestion) return;

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setCurrentIndex(i => i + 1);
  }

  function goBack() {
    setCurrentIndex(i => Math.max(0, i - 1));
  }

  return {
    currentQuestion,
    answers,
    progress,
    currentStep: currentIndex + 1,
    totalSteps: visibleQuestions.length,
    goNext,
    goBack,
    isComplete,
    isLoading: data === null,
    generatedBudget,
  };
}
