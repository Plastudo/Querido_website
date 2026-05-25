/**
 * Evaluates a quantity formula from question_rules.
 *
 * Supported syntax:
 *   Q{index}        → replaced with the numeric answer for that question
 *   sqrt(x)         → Math.sqrt(x)
 *   +  -  *  /  ()  → standard arithmetic
 *
 * Examples:
 *   "1"                      → 1
 *   "sqrt(Q1.1.1)*4"         → sqrt(area) * 4  (perimeter estimate)
 *   "sqrt(Q1.1.1)*4*Q1.3.1"  → perimeter * height
 */
export function evaluateFormula(
  formula: string,
  numericAnswers: Record<string, number>,
): number {
  if (!formula || formula.trim() === '') return 0;

  // Replace Q{index} references with their numeric values
  let expr = formula.replace(/Q([\d.]+)/g, (_match, index: string) => {
    const val = numericAnswers[index];
    return val !== undefined ? String(val) : '0';
  });

  // Replace sqrt( with Math.sqrt(
  expr = expr.replace(/\bsqrt\(/gi, 'Math.sqrt(');

  // Whitelist: only allow digits, arithmetic ops, parens, dots, Math.sqrt
  const stripped = expr.replace(/Math\.sqrt/g, '');
  if (/[^0-9+\-*/.() \t]/.test(stripped)) {
    console.warn('[formulaEvaluator] Rejected formula with unexpected chars:', formula);
    return 0;
  }

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${expr})`)() as number;
    return Number.isFinite(result) && result >= 0 ? result : 0;
  } catch {
    return 0;
  }
}

/** Converts a mixed-type answers map to all-numeric for formula evaluation. */
export function toNumericAnswers(
  answers: Record<string, string | number>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(answers).map(([k, v]) => [k, Number(v) || 0]),
  );
}
