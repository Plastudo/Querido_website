import { useState, useEffect } from 'react';
import type { QuestionWithOptions, OptionWithDetails } from '../../types/questionnaire';

interface Props {
  question: QuestionWithOptions;
  savedAnswer: string | number | undefined;
  savedMultiAnswers?: string[];
  onAnswerWithOption: (option: OptionWithDetails, addonOptions?: OptionWithDetails[]) => void;
  onAnswerMulti: (values: string[], options: OptionWithDetails[]) => void;
  onAnswerNumeric: (value: number) => void;
  onAnswerText: (value: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}

// ── Simple markdown renderer (bold, bullets, paragraphs) ──────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pi) => {
    const lines = para.split('\n');
    const isBulletBlock = lines.every(l => l.trimStart().startsWith('- ') || l.trim() === '');
    if (isBulletBlock) {
      return (
        <ul key={pi} style={{ margin: '0 0 10px', paddingLeft: 20, listStyle: 'disc' }}>
          {lines.filter(l => l.trim()).map((l, li) => (
            <li key={li} style={{ marginBottom: 3 }}>{renderInline(l.replace(/^-\s*/, ''))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={pi} style={{ margin: '0 0 10px' }}>
        {lines.map((l, li) => (
          <span key={li}>{renderInline(l)}{li < lines.length - 1 && <br />}</span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

export default function QuestionRenderer({
  question,
  savedAnswer,
  savedMultiAnswers = [],
  onAnswerWithOption,
  onAnswerMulti,
  onAnswerNumeric,
  onAnswerText,
  onBack,
  canGoBack,
}: Props) {
  const [numericValue, setNumericValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set(savedMultiAnswers));
  const [addonSelected, setAddonSelected] = useState<Set<string>>(new Set());
  const [pendingChoice, setPendingChoice] = useState<OptionWithDetails | null>(null);

  // Parse savedAnswer — may be JSON array "[mainValue, addon1, ...]" when linked add-ons were selected
  const parsedSavedChoice = (() => {
    if (savedAnswer === undefined) return { mainValue: undefined, addonValues: [] as string[] };
    try {
      const parsed = JSON.parse(String(savedAnswer));
      if (Array.isArray(parsed)) return { mainValue: parsed[0] as string, addonValues: parsed.slice(1) as string[] };
    } catch { /* not JSON */ }
    return { mainValue: String(savedAnswer), addonValues: [] as string[] };
  })();

  useEffect(() => {
    setNumericValue(
      question.type === 'numeric' && savedAnswer !== undefined ? String(savedAnswer) : '',
    );
    setTextValue(
      question.type === 'text' && savedAnswer !== undefined ? String(savedAnswer) : '',
    );
    setMultiSelected(new Set(savedMultiAnswers));
    // Restore add-on state when going back to a question that had linked add-ons
    setAddonSelected(new Set(parsedSavedChoice.addonValues));
    setPendingChoice(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const mainOptions = question.options.filter(o => !o.is_addon);
  const globalAddonOptions = question.options.filter(o => o.is_addon && !o.parent_option_id);
  // Map from parent option id → linked add-ons
  const linkedAddonsMap = new Map<number, OptionWithDetails[]>();
  for (const o of question.options.filter(o => o.is_addon && o.parent_option_id != null)) {
    const list = linkedAddonsMap.get(o.parent_option_id!) ?? [];
    list.push(o);
    linkedAddonsMap.set(o.parent_option_id!, list);
  }
  const hasLinkedAddons = linkedAddonsMap.size > 0;

  const handleMultiToggle = (value: string) => {
    setMultiSelected(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const handleAddonToggle = (value: string) => {
    setAddonSelected(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const handleMultiSubmit = () => {
    const allSelected = new Set([...multiSelected, ...addonSelected]);
    const selectedOptions = question.options.filter(o => allSelected.has(o.value));
    onAnswerMulti([...allSelected], selectedOptions);
  };

  // ── Option button (single select: boolean + choice) ───────────────────────────
  const OptionButton = ({ option }: { option: OptionWithDetails }) => {
    const activeValue = pendingChoice?.value ?? parsedSavedChoice.mainValue;
    const isSelected = activeValue === option.value;
    const [showInfo, setShowInfo] = useState(false);
    const linkedAddons = linkedAddonsMap.get(option.id) ?? [];

    const handleClick = () => {
      if (hasLinkedAddons) {
        // Select without auto-advancing — user must click Continuar
        setPendingChoice(option);
        setAddonSelected(new Set());
      } else {
        onAnswerWithOption(option);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
          <span style={{ flex: 1, fontSize: 17, fontWeight: 500, letterSpacing: -0.2, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {option.label}
          </span>
          {option.addon_info && (
            <div
              style={{ position: 'relative', flexShrink: 0 }}
              onClick={e => { e.stopPropagation(); setShowInfo(v => !v); }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '1.5px solid rgba(29,29,31,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'rgba(29,29,31,0.5)',
                cursor: 'help',
              }}>?</div>
              {showInfo && (
                <div style={{
                  position: 'absolute', right: 0, bottom: 28, zIndex: 10,
                  background: '#fff', border: '1px solid rgba(29,29,31,0.12)',
                  borderRadius: 10, padding: '12px 14px', width: 260,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5,
                }}>
                  {option.addon_info}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Linked add-ons — shown below this option when selected */}
        {isSelected && linkedAddons.map(addon => (
          <AddonCheckbox
            key={addon.id}
            option={addon}
            checked={addonSelected.has(addon.value)}
            onToggle={() => handleAddonToggle(addon.value)}
            indent
          />
        ))}
      </div>
    );
  };

  // ── Checkbox option (multi_choice) ────────────────────────────────────────────
  const CheckboxOption = ({ option, checked, onToggle }: { option: OptionWithDetails; checked: boolean; onToggle: () => void }) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '13px 18px',
          background: checked ? 'var(--color-primary-bg)' : 'var(--color-bg-card)',
          border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
          borderRadius: 'var(--radius-input)',
          cursor: 'pointer',
          transition: 'border-color var(--transition-base), background var(--transition-base)',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
          background: checked ? 'var(--color-primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition-base)',
        }}>
          {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {option.label}
        </span>
        {option.addon_info && (
          <div
            style={{ position: 'relative', flexShrink: 0 }}
            onClick={e => { e.stopPropagation(); setShowInfo(v => !v); }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '1.5px solid rgba(29,29,31,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'rgba(29,29,31,0.5)',
              cursor: 'help',
            }}>?</div>
            {showInfo && (
              <div style={{
                position: 'absolute', right: 0, bottom: 28, zIndex: 10,
                background: '#fff', border: '1px solid rgba(29,29,31,0.12)',
                borderRadius: 10, padding: '12px 14px', width: 260,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5,
              }}>
                {option.addon_info}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Addon checkbox (with optional info tooltip) ───────────────────────────────
  const AddonCheckbox = ({ option, checked, onToggle, indent }: { option: OptionWithDetails; checked: boolean; onToggle: () => void; indent?: boolean }) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '11px 16px',
          marginLeft: indent ? 16 : 0,
          background: checked ? 'rgba(83,74,183,0.06)' : 'rgba(29,29,31,0.03)',
          border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border-input)'}`,
          borderRadius: 10,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onToggle}
      >
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `2px solid ${checked ? 'var(--color-primary)' : 'rgba(29,29,31,0.25)'}`,
          background: checked ? 'var(--color-primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition-base)',
        }}>
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text-primary)' }}>{option.label}</span>
        {option.addon_info && (
          <div style={{ position: 'relative' }}
            onClick={e => { e.stopPropagation(); setShowInfo(v => !v); }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: '1.5px solid rgba(29,29,31,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'rgba(29,29,31,0.5)',
              cursor: 'help',
            }}>i</div>
            {showInfo && (
              <div style={{
                position: 'absolute', right: 0, bottom: 26, zIndex: 10,
                background: '#fff', border: '1px solid rgba(29,29,31,0.12)',
                borderRadius: 10, padding: '12px 14px', width: 260,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5,
              }}>
                {option.addon_info}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const choiceNeedsSubmit = (question.type === 'boolean' || question.type === 'choice') && hasLinkedAddons && pendingChoice != null;
  const needsExplicitSubmit = question.type === 'numeric' || question.type === 'text' || question.type === 'multi_choice' || choiceNeedsSubmit;

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

      {/* Help text — rendered as markdown */}
      {question.help_text && (
        <div style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-8)',
        }}>
          {renderMarkdown(question.help_text)}
        </div>
      )}

      {/* Single-select options (boolean + choice) */}
      {(question.type === 'boolean' || question.type === 'choice') && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {mainOptions.map(opt => (
              <OptionButton key={opt.id} option={opt} />
            ))}
          </div>
          {globalAddonOptions.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Extras opcionais
              </p>
              {globalAddonOptions.map(opt => (
                <AddonCheckbox
                  key={opt.id}
                  option={opt}
                  checked={addonSelected.has(opt.value)}
                  onToggle={() => handleAddonToggle(opt.value)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Multi-select (multi_choice) */}
      {question.type === 'multi_choice' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {mainOptions.map(opt => (
              <CheckboxOption
                key={opt.id}
                option={opt}
                checked={multiSelected.has(opt.value)}
                onToggle={() => handleMultiToggle(opt.value)}
              />
            ))}
          </div>
          {addonOptions.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Extras opcionais
              </p>
              {addonOptions.map(opt => (
                <AddonCheckbox
                  key={opt.id}
                  option={opt}
                  checked={addonSelected.has(opt.value)}
                  onToggle={() => handleAddonToggle(opt.value)}
                />
              ))}
            </div>
          )}
        </>
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
            onClick={() => {
              if (choiceNeedsSubmit && pendingChoice) {
                const selectedAddons = question.options.filter(o => o.is_addon && addonSelected.has(o.value));
                onAnswerWithOption(pendingChoice, selectedAddons.length > 0 ? selectedAddons : undefined);
              } else if (question.type === 'numeric') {
                handleNumericSubmit();
              } else if (question.type === 'multi_choice') {
                handleMultiSubmit();
              } else {
                handleTextSubmit();
              }
            }}
            disabled={
              choiceNeedsSubmit ? false
              : question.type === 'numeric' ? !isNumericValid()
              : question.type === 'multi_choice' ? multiSelected.size === 0
              : !textValue.trim()
            }
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
