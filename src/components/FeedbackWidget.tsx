import { useState, useRef, useEffect } from 'react';
import { submitFeedback, type FeedbackType } from '../services/feedbackService';

type Step = 'closed' | 'choose' | 'form' | 'success';

const EMPTY = { location: '', description: '', expected_behavior: '' };

export default function FeedbackWidget() {
  const [step, setStep] = useState<Step>('closed');
  const [type, setType] = useState<FeedbackType>('bug');
  const [fields, setFields] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    if (step === 'closed') return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        reset();
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [step]);

  function reset() {
    setStep('closed');
    setFields(EMPTY);
    setError('');
    setLoading(false);
  }

  function openWithType(t: FeedbackType) {
    setType(t);
    setFields(EMPTY);
    setError('');
    setStep('form');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.location.trim() || !fields.description.trim()) return;
    setLoading(true);
    setError('');
    try {
      await submitFeedback({
        type,
        location: fields.location.trim(),
        description: fields.description.trim(),
        expected_behavior: type === 'bug' ? fields.expected_behavior.trim() || undefined : undefined,
      });
      setStep('success');
    } catch {
      setError('Erro ao enviar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  function set(field: keyof typeof EMPTY, value: string) {
    setFields(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

      {/* Painel */}
      {step !== 'closed' && (
        <div style={{
          width: '340px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-card)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          animation: 'fw-slide-up 0.2s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
              {step === 'choose' && 'O que queres reportar?'}
              {step === 'form' && (type === 'bug' ? '🐛 Reportar bug' : '💡 Sugerir melhoria')}
              {step === 'success' && 'Obrigado!'}
            </span>
            <button onClick={reset} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-secondary)', display: 'flex' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Escolha */}
          {step === 'choose' && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ChoiceCard
                emoji="🐛"
                title="Bug"
                desc="Algo não está a funcionar como esperado"
                onClick={() => openWithType('bug')}
              />
              <ChoiceCard
                emoji="💡"
                title="Melhoria"
                desc="Uma ideia ou sugestão para o produto"
                onClick={() => openWithType('improvement')}
              />
            </div>
          )}

          {/* Formulário */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field
                label="Onde encontraste?"
                placeholder={type === 'bug' ? 'Ex: página de orçamento, passo 2' : 'Ex: painel admin, listagem de divisões'}
                value={fields.location}
                onChange={v => set('location', v)}
                required
              />
              <Field
                label={type === 'bug' ? 'O que aconteceu?' : 'O que gostavas de ver?'}
                placeholder={type === 'bug' ? 'Descreve o erro com detalhe' : 'Descreve a melhoria que queres'}
                value={fields.description}
                onChange={v => set('description', v)}
                multiline
                required
              />
              {type === 'bug' && (
                <Field
                  label="O que seria o comportamento correto?"
                  placeholder="O que devia acontecer em vez disso"
                  value={fields.expected_behavior}
                  onChange={v => set('expected_behavior', v)}
                  multiline
                />
              )}
              {error && <p style={{ fontSize: '12px', color: '#c0392b', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button type="button" onClick={() => setStep('choose')} style={secondaryBtn}>Voltar</button>
                <button type="submit" disabled={loading} style={primaryBtn}>
                  {loading ? 'A enviar…' : 'Enviar'}
                </button>
              </div>
            </form>
          )}

          {/* Sucesso */}
          {step === 'success' && (
            <div style={{ padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '32px' }}>✅</span>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>Feedback recebido!</p>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Obrigado por ajudares a melhorar o produto.</p>
              <button onClick={reset} style={{ ...primaryBtn, marginTop: '8px' }}>Fechar</button>
            </div>
          )}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => step === 'closed' ? setStep('choose') : reset()}
        aria-label="Feedback"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(83,74,183,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        {step === 'closed'
          ? <BugIcon />
          : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        }
      </button>

      <style>{`
        @keyframes fw-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ChoiceCard({ emoji, title, desc, onClick }: { emoji: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '10px',
      padding: '12px 14px',
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
    >
      <span style={{ fontSize: '22px' }}>{emoji}</span>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>{desc}</p>
      </div>
    </button>
  );
}

function Field({ label, placeholder, value, onChange, multiline, required }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; multiline?: boolean; required?: boolean;
}) {
  const shared: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid var(--color-border-input)',
    background: 'var(--color-bg-surface)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family)',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}{required && ' *'}</label>
      {multiline
        ? <textarea rows={3} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required} style={shared} />
        : <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required} style={shared} />
      }
    </div>
  );
}

function BugIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.5 1.5"/>
      <path d="M14.5 3.5L16 2"/>
      <path d="M9 9h6"/>
      <path d="M9 12h6"/>
      <path d="M9 15h6"/>
      <path d="M10 2a2 2 0 0 1 4 0"/>
      <path d="M12 20c-4 0-7-2.686-7-6V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5c0 3.314-3 6-7 6z"/>
      <path d="M5 12H2"/>
      <path d="M22 12h-3"/>
      <path d="M5 8l-2-2"/>
      <path d="M21 6l-2 2"/>
      <path d="M5 16l-2 2"/>
      <path d="M21 18l-2-2"/>
    </svg>
  );
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
};

const secondaryBtn: React.CSSProperties = {
  background: 'var(--color-bg-surface)',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
};
