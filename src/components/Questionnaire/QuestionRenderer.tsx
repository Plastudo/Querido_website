import { useState, useEffect } from 'react';
import type { QuestionWithOptions, OptionWithDetails } from '../../types/questionnaire';

interface Props {
  question: QuestionWithOptions;
  savedAnswer: string | number | undefined;
  onAnswerWithOption: (option: OptionWithDetails) => void;
  onAnswerNumeric: (value: number) => void;
  onAnswerText: (value: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

export default function QuestionRenderer({
  question,
  savedAnswer,
  onAnswerWithOption,
  onAnswerNumeric,
  onAnswerText,
  onBack,
  canGoBack,
}: Props) {
  const [numericValue, setNumericValue] = useState('');
  const [textValue, setTextValue] = useState('');

  // Reset local state when question changes
  useEffect(() => {
    setNumericValue(
      question.type === 'numeric' && savedAnswer !== undefined ? String(savedAnswer) : '',
    );
    setTextValue(
      question.type === 'text' && savedAnswer !== undefined ? String(savedAnswer) : '',
    );
  }, [question.id, savedAnswer, question.type]);

  const handleNumericSubmit = () => {
    const n = parseFloat(numericValue);
    if (!Number.isFinite(n) || n <= 0) return;
    onAnswerNumeric(n);
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) return;
    onAnswerText(textValue.trim());
  };

  const isNumericValid = () => {
    const n = parseFloat(numericValue);
    return Number.isFinite(n) && n > 0;
  };

  // ── Option button (boolean + choice) ─────────────────────────────────────────
  const OptionButton = ({ option }: { option: OptionWithDetails }) => {
    const isSelected = savedAnswer === option.value;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onAnswerWithOption(option)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onAnswerWithOption(option); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          padding: '14px 20px',
          background: isSelected ? 'var(--color-primary-bg)' : 'var(--color-bg-card)',
          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
          borderRadius: 'var(--radius-input)',
          cursor: 'pointer',
          transition: 'border-color var(--transition-base), background var(--transition-base)',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          if (!isSelected)
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.25)';
        }}
        onMouseLeave={e => {
          if (!isSelected)
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-input)';
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {option.label}
        </span>
      </div>
    );
  };

  const needsExplicitSubmit = question.type === 'numeric' || question.type === 'text';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Question text */}
      <h2 style={{
        fontSize: 36,
        fontWeight: 500,
        letterSpacing: -0.5,
        lineHeight: 1.15,
        color: 'var(--color-text-primary)',
        marginBottom: question.help_text ? 'var(--space-4)' : 'var(--space-8)',
      }}>
        {question.text}
      </h2>

      {/* Help text */}
      {question.help_text && (
        <p style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-8)',
        }}>
          {question.help_text}
        </p>
      )}

      {/* Boolean / choice → option buttons (auto-advance) */}
      {(question.type === 'boolean' || question.type === 'choice') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {question.options.map(opt => (
            <OptionButton key={opt.id} option={opt} />
          ))}
        </div>
      )}

      {/* Numeric input */}
      {question.type === 'numeric' && (
        <div className="form-field">
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.1"
            value={numericValue}
            onChange={e => setNumericValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleNumericSubmit(); }}
            placeholder="0"
            autoFocus
            style={{ fontSize: 17 }}
          />
        </div>
      )}

      {/* Text input */}
      {question.type === 'text' && (
        <div className="form-field">
          <textarea
            className="form-textarea"
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            rows={3}
            placeholder="Introduza a sua resposta"
            autoFocus
            style={{ fontSize: 17 }}
          />
        </div>
      )}

      {/* Navigation */}
      {needsExplicitSubmit && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
          {canGoBack && (
            <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: 15 }}>
              ← Voltar
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 15 }}
            onClick={question.type === 'numeric' ? handleNumericSubmit : handleTextSubmit}
            disabled={question.type === 'numeric' ? !isNumericValid() : !textValue.trim()}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Back link for auto-advance questions */}
      {!needsExplicitSubmit && canGoBack && (
        <button
          onClick={onBack}
          style={{
            marginTop: 'var(--space-6)',
            fontSize: 14,
            color: 'var(--color-text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            padding: 0,
            transition: 'color var(--transition-base)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
        >
          ← Voltar
        </button>
      )}
    </div>
  );
}
