import type { LiveBudget } from '../../types/questionnaire';

interface Props {
  budget: LiveBudget;
}

const fmt = (n: number) =>
  n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export default function LiveBudgetPanel({ budget }: Props) {
  const hasItems = budget.categories.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          marginBottom: 'var(--space-2)',
        }}>
          Estimativa
        </h3>
        <div style={{
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: -1,
          color: 'var(--color-text-primary)',
        }}>
          {fmt(budget.totals.grand)}
        </div>
        {hasItems && (
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-3)',
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}>
            <span>Mat. {fmt(budget.totals.material)}</span>
            <span>MO {fmt(budget.totals.labor)}</span>
            <span>Ind. {fmt(budget.totals.overhead)}</span>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--color-border-subtle)', marginBottom: 'var(--space-6)' }} />

      {/* Empty state */}
      {!hasItems && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <span style={{ fontSize: 32 }}>📋</span>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            O orçamento será calculado<br />à medida que respondes
          </p>
        </div>
      )}

      {/* Categories + line items */}
      {hasItems && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {budget.categories.map(cat => (
            <div key={cat.name}>
              {/* Category header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--space-2)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {fmt(cat.subtotal)}
                </span>
              </div>

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {cat.items.map(item => (
                  <div
                    key={item.optionId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      padding: '10px 14px',
                      background: 'rgba(0,0,0,0.025)',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {item.quantity % 1 === 0
                          ? item.quantity
                          : item.quantity.toFixed(1)} un ×{' '}
                        {fmt((item.materialCost + item.laborCost + item.overheadCost) / item.quantity)}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                      {fmt(item.totalCost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals breakdown */}
      {hasItems && (
        <>
          <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: 'var(--space-6) 0 var(--space-4)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[
              { label: 'Materiais',       value: budget.totals.material  },
              { label: 'Mão de Obra',     value: budget.totals.labor     },
              { label: 'Custos Indiretos',value: budget.totals.overhead  },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{fmt(row.value)}</span>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border-subtle)',
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)' }}>{fmt(budget.totals.grand)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
