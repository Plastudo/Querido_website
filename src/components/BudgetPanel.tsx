import type { Budget, Region } from '../types';

interface Props {
  budget: Budget | null;
  region: Region;
  multiplier: number;
}

const UNIT_LABEL: Record<string, string> = {
  m2: 'm²', ml: 'ml', un: 'un', hr: 'h', vb: 'vb',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

/* Material dot: warm amber from the design system (cat-eletricidade-icon) */
const COLOR_MATERIAL = 'var(--cat-eletricidade-icon)';
const COLOR_LABOR    = 'var(--color-primary)';

export default function BudgetPanel({ budget, region, multiplier }: Props) {
  if (!budget || budget.sections.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-body-sm-size)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Orçamento em tempo real
          </h3>
          <span style={{
            fontSize: 'var(--text-footer-size)',
            background: 'var(--color-bg-surface)',
            color: 'var(--color-text-muted)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-badge)',
          }}>
            {region}
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-body-sm-size)', color: 'var(--color-text-muted)' }}>
          As estimativas aparecerão aqui à medida que respondes às perguntas.
        </p>
      </div>
    );
  }

  const adjustedTotal = budget.totalPrice * multiplier;

  let materialCount = 0;
  let laborCount = 0;
  budget.sections.forEach(s => s.items.forEach(i => {
    if (i.category === 'material') materialCount++;
    else laborCount++;
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 'var(--text-body-sm-size)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Orçamento em tempo real
        </h3>
        <span style={{
          fontSize: 'var(--text-footer-size)',
          background: 'var(--color-primary-bg)',
          color: 'var(--color-primary)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-badge)',
          fontWeight: 500,
        }}>
          {region}
        </span>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)',
        fontSize: 'var(--text-footer-size)',
        color: 'var(--color-text-muted)',
      }}>
        {materialCount > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_MATERIAL, display: 'inline-block' }} />
            Materiais
          </span>
        )}
        {laborCount > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_LABOR, display: 'inline-block' }} />
            Mão de obra
          </span>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {budget.sections.map(section => {
          const sectionTotal = section.items.reduce(
            (sum, item) => sum + item.totalPrice * multiplier, 0,
          );
          return (
            <div key={section.title}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {section.title}
                </span>
                <span style={{ fontSize: 'var(--text-footer-size)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                  {fmt(sectionTotal)}
                </span>
              </div>

              <div>
                {section.items.map(item => {
                  const adjustedUnit  = item.unitPrice  * multiplier;
                  const adjustedItem  = item.totalPrice * multiplier;
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--color-border-subtle)',
                    }}>
                      <span style={{
                        marginTop: 4, flexShrink: 0,
                        width: 6, height: 6, borderRadius: '50%',
                        background: item.category === 'material' ? COLOR_MATERIAL : COLOR_LABOR,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--text-footer-size)', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {item.quantity} {UNIT_LABEL[item.unit] ?? item.unit} × {fmt(adjustedUnit)}
                        </div>
                      </div>
                      <div style={{ fontSize: 'var(--text-footer-size)', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                        {fmt(adjustedItem)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--text-body-sm-size)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Total estimado
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
            {fmt(adjustedTotal)}
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Preços médios de mercado · {region}
        </p>
      </div>

    </div>
  );
}
