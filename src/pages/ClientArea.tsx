import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchClientBudgets,
  deleteClientBudget,
  type ClientBudgetSummary,
} from '../services/clientBudgetService';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  budget: ClientBudgetSummary;
  onOpen: () => void;
  onDelete: () => void;
}

function BudgetCard({ budget, onOpen, onDelete }: CardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-card)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow var(--transition-base)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ height: 4, background: 'var(--color-primary)', opacity: 0.7 }} />

      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Título + data */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{
            fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)',
            letterSpacing: -0.2, lineHeight: 1.3, margin: 0,
          }}>
            {budget.name}
          </h3>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              {formatDate(budget.updated_at)}
            </div>
          </div>
        </div>

        {/* Divisões como chips */}
        {budget.division_labels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {budget.division_labels.map((label, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px',
                  background: 'var(--color-primary-bg)',
                  borderRadius: 'var(--radius-badge)',
                  fontSize: 12, fontWeight: 500, color: 'var(--color-primary)',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Metadados */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          {budget.division_labels.length} {budget.division_labels.length === 1 ? 'divisão' : 'divisões'}
        </div>
      </div>

      {/* Rodapé: ações */}
      <div style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        background: 'var(--color-bg-surface)',
        gap: 8,
      }}>
        {confirming ? (
          <>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginRight: 4 }}>
              Eliminar?
            </span>
            <button
              className="btn btn--sm"
              onClick={onDelete}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 'var(--radius-button)', fontSize: 13, fontWeight: 500, padding: '6px 12px', cursor: 'pointer' }}
            >
              Sim
            </button>
            <button className="btn btn-ghost btn--sm" onClick={() => setConfirming(false)}>Não</button>
          </>
        ) : (
          <>
            <button
              className="btn btn-ghost btn--sm"
              onClick={() => setConfirming(true)}
              style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Eliminar
            </button>
            <button
              className="btn btn-primary btn--sm"
              onClick={onOpen}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Abrir
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientArea() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<ClientBudgetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientBudgets()
      .then(setBudgets)
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deleteClientBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleOpen = (budget: ClientBudgetSummary) => {
    navigate('/orcamento/obra', { state: { savedBudgetId: budget.id } });
  };

  if (isLoading) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>A carregar orçamentos…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>{error}</p>
      </main>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (budgets.length === 0) {
    return (
      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', fontFamily: 'var(--font-family)', padding: '0 24px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'var(--color-primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        }}>
          <svg width="28" height="28" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, letterSpacing: -0.4 }}>
          Ainda sem orçamentos guardados
        </h1>
        <p style={{ marginTop: 10, fontSize: 16, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 380 }}>
          Crie o seu primeiro orçamento e guarde-o para consultar mais tarde.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Criar orçamento
        </button>
      </main>
    );
  }

  // ── Lista de orçamentos ─────────────────────────────────────────────────────

  return (
    <main style={{ fontFamily: 'var(--font-family)', minHeight: 'calc(100vh - 64px)' }}>

      <div style={{
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '28px 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.6, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.1 }}>
            Os meus orçamentos
          </h1>
          <p style={{ marginTop: 6, fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)' }}>
            {budgets.length} {budgets.length === 1 ? 'orçamento guardado' : 'orçamentos guardados'}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Novo orçamento
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--card-gap)',
        padding: '32px 64px',
        maxWidth: 1040,
        margin: '0 auto',
      }}>
        {budgets.map(budget => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onOpen={() => handleOpen(budget)}
            onDelete={() => handleDelete(budget.id)}
          />
        ))}
      </div>
    </main>
  );
}
