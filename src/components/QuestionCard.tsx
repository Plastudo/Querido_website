import { useState, useEffect } from 'react';
import type { Question } from '../types';

interface Props {
  question: Question;
  savedAnswer: string | string[] | number | undefined;
  onNext: (answer: string | string[] | number) => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function QuestionCard({ question, savedAnswer, onNext, onBack, isFirst }: Props) {
  const [value, setValue] = useState<string | string[] | number>(
    savedAnswer ?? (question.type === 'multi_select' ? [] : ''),
  );

  useEffect(() => {
    setValue(savedAnswer ?? (question.type === 'multi_select' ? [] : ''));
  }, [question.id, savedAnswer]);

  const canAdvance: boolean = (() => {
    if (question.type === 'number') return value !== '' && !isNaN(Number(value)) && Number(value) > 0;
    if (question.type === 'text') return String(value).trim().length > 0;
    if (question.type === 'multi_select') return (value as string[]).length > 0;
    return false;
  })();

  const handleMultiToggle = (optionValue: string) => {
    const arr = value as string[];
    setValue(arr.includes(optionValue) ? arr.filter(v => v !== optionValue) : [...arr, optionValue]);
  };

  const handleAdvance = () => {
    if (!canAdvance) return;
    onNext(question.type === 'number' ? Number(value) : value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Question title */}
      <h2 style={{
        fontSize: 36,
        fontWeight: 500,
        letterSpacing: -0.5,
        lineHeight: 1.15,
        color: 'var(--color-text-primary)',
        marginBottom: question.hint ? 'var(--space-4)' : 'var(--space-8)',
      }}>
        {question.label}
      </h2>

      {/* Hint text */}
      {question.hint && (
        <p style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-8)',
        }}>
          {question.hint}
        </p>
      )}

      {/* Single select */}
      {question.type === 'single_select' && question.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {question.options.map(opt => {
            const isSelected = savedAnswer === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => onNext(opt.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onNext(opt.value); }}
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
                  if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.25)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-input)';
                }}
              >
                <span style={{
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: -0.2,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.3,
                }}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span style={{
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4,
                  }}>
                    {opt.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Multi select */}
      {question.type === 'multi_select' && question.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {question.options.map(opt => {
            const selected = (value as string[]).includes(opt.value);
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => handleMultiToggle(opt.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleMultiToggle(opt.value); }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: '14px 20px',
                  background: selected ? 'var(--color-primary-bg)' : 'var(--color-bg-card)',
                  border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
                  borderRadius: 'var(--radius-input)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-base), background var(--transition-base)',
                  userSelect: 'none',
                }}
              >
                <span style={{
                  marginTop: 2, flexShrink: 0,
                  width: 18, height: 18, borderRadius: 5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: selected ? 'var(--color-primary)' : 'transparent',
                  border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
                  color: '#fff',
                  flexDirection: 'column',
                }}>
                  {selected ? '✓' : ''}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.2, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {opt.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Number input */}
      {question.type === 'number' && (
        <div className="form-field">
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.1"
            value={String(value)}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdvance(); }}
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
            value={String(value)}
            onChange={e => setValue(e.target.value)}
            rows={3}
            placeholder="Introduza a sua resposta"
            autoFocus
            style={{ fontSize: 17 }}
          />
        </div>
      )}

      {/* Navigation */}
      {question.type !== 'single_select' && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
          {!isFirst && (
            <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: 15 }}>
              ← Voltar
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 15 }}
            onClick={handleAdvance}
            disabled={!canAdvance}
          >
            Continuar →
          </button>
        </div>
      )}

      {question.type === 'single_select' && !isFirst && (
        <button
          onClick={onBack}
          style={{
            marginTop: 'var(--space-6)',
            fontSize: 14,
            color: 'var(--color-text-tertiary)',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color var(--transition-base)',
            alignSelf: 'flex-start',
            padding: 0,
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
