import { categories } from '../styles/tokens';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2 style={{
        fontSize: 'var(--text-h2-size)',
        fontWeight: 'var(--text-h2-weight)',
        letterSpacing: 'var(--text-h2-tracking)',
        color: 'var(--color-text-primary)',
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ label, value, textDark }: { label: string; value: string; textDark?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 80 }}>
      <div style={{
        width: 64, height: 64,
        borderRadius: 'var(--radius-card)',
        background: value,
        border: '1px solid var(--color-border-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {textDark && <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>Aa</span>}
      </div>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

function TokenRow({ name, value }: { name: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '8px 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <code style={{ fontSize: 12, color: 'var(--color-primary)', minWidth: 220, fontFamily: 'monospace' }}>
        {name}
      </code>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>{value}</span>
    </div>
  );
}

/* ─── main ────────────────────────────────────────────────────────────────── */

export default function StyleGuide() {
  return (
    <div style={{
      fontFamily: 'var(--font-family)',
      background: 'var(--color-bg-page)',
      minHeight: '100vh',
      padding: '48px var(--layout-padding-x-sm)',
      maxWidth: 960,
      margin: '0 auto',
    }}>

      {/* Page title */}
      <div style={{ marginBottom: 48 }}>
        <span className="badge-start">
          <span className="badge-start__dot" />
          Design System
        </span>
        <h1 style={{
          fontSize: 'var(--text-h1-size)',
          fontWeight: 'var(--text-h1-weight)',
          letterSpacing: 'var(--text-h1-tracking)',
          color: 'var(--color-text-primary)',
          marginTop: 12,
          marginBottom: 8,
        }}>
          Style Guide
        </h1>
        <p style={{ fontSize: 'var(--text-body-sm-size)', color: 'var(--color-text-secondary)' }}>
          Tokens e componentes do design system — <strong>Orçamentos de Obras</strong>
        </p>
      </div>

      {/* ── Colors ─────────────────────────────────────────────────────────── */}
      <Section title="Cores — Marca e texto">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <Swatch label="--color-primary"       value="rgb(83, 74, 183)" />
          <Swatch label="--color-primary-bg"    value="rgba(83,74,183,0.08)" />
          <Swatch label="--color-primary-hover" value="rgb(70, 62, 160)" />
          <Swatch label="--color-primary-light" value="rgb(241, 235, 244)" />
          <Swatch label="--color-bg-page"       value="rgb(255,255,255)" />
          <Swatch label="--color-bg-surface"    value="rgb(249,248,246)" />
          <Swatch label="--color-text-primary"  value="rgb(29,29,31)" />
          <Swatch label="--color-border-card"   value="rgba(0,0,0,0.10)" />
        </div>
      </Section>

      {/* ── Category colors ─────────────────────────────────────────────────── */}
      <Section title="Cores — Categorias de obra">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 'var(--icon-container-size)',
                height: 'var(--icon-container-size)',
                borderRadius: 'var(--radius-icon)',
                background: cat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={cat.icon} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Typography ──────────────────────────────────────────────────────── */}
      <Section title="Tipografia">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>--text-hero-size · 56px · weight 500</p>
            <p style={{ fontSize: 'var(--text-hero-size)', fontWeight: 'var(--text-hero-weight)', letterSpacing: 'var(--text-hero-tracking)', lineHeight: 'var(--text-hero-height)', color: 'var(--color-text-primary)' }}>
              Orçamentos de Obras
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>--text-h1-size · 40px · weight 500</p>
            <p style={{ fontSize: 'var(--text-h1-size)', fontWeight: 'var(--text-h1-weight)', letterSpacing: 'var(--text-h1-tracking)', color: 'var(--color-text-primary)' }}>
              Título de página
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>--text-h2-size · 24px · weight 500</p>
            <p style={{ fontSize: 'var(--text-h2-size)', fontWeight: 'var(--text-h2-weight)', letterSpacing: 'var(--text-h2-tracking)', color: 'var(--color-text-primary)' }}>
              Título de secção
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>--text-body-size · 19px</p>
            <p style={{ fontSize: 'var(--text-body-size)', lineHeight: 'var(--text-body-height)', color: 'var(--color-text-secondary)' }}>
              Texto de corpo — descrição de serviços de remodelação para habitações em Portugal. Estimativas baseadas em preços médios de mercado 2024/2025.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>--text-label-size · 13.5px</p>
            <p style={{ fontSize: 'var(--text-label-size)', lineHeight: 'var(--text-label-height)', color: 'var(--color-text-muted)' }}>
              Label / texto auxiliar — informação secundária
            </p>
          </div>
        </div>
      </Section>

      {/* ── Buttons ─────────────────────────────────────────────────────────── */}
      <Section title="Botões">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-primary">Primário</button>
          <button className="btn btn-primary btn--lg">Primário Grande</button>
          <button className="btn btn-secondary">Secundário</button>
          <button className="btn btn-secondary btn--sm">Secundário Pequeno</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-primary" disabled>Desativado</button>
        </div>
      </Section>

      {/* ── Badge ───────────────────────────────────────────────────────────── */}
      <Section title="Badge">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span className="badge-start">
            <span className="badge-start__dot" />
            Comece aqui
          </span>
          <span className="badge-start" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-secondary)' }}>
            <span className="badge-start__dot" style={{ background: 'var(--color-text-tertiary)' }} />
            Neutro
          </span>
        </div>
      </Section>

      {/* ── Form inputs ─────────────────────────────────────────────────────── */}
      <Section title="Campos de formulário">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <div className="form-field">
            <label className="form-label">Área da cozinha (m²)</label>
            <input className="form-input" type="number" placeholder="Ex.: 12" />
            <span className="form-hint">Multiplique comprimento × largura</span>
          </div>
          <div className="form-field">
            <label className="form-label">Região</label>
            <select className="form-select">
              <option>Norte</option>
              <option>Centro</option>
              <option>Lisboa e Sul</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Observações</label>
            <textarea className="form-textarea" placeholder="Descreva o trabalho pretendido…" />
          </div>
        </div>
      </Section>

      {/* ── Option group ────────────────────────────────────────────────────── */}
      <Section title="Opções de seleção">
        <div className="option-group" style={{ maxWidth: 480 }}>
          <div className="option-item is-selected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
            Novo pavimento cerâmico
          </div>
          <div className="option-item">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-border-input)', flexShrink: 0 }} />
            Novo pavimento vinílico
          </div>
          <div className="option-item">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-border-input)', flexShrink: 0 }} />
            Manter pavimento atual
          </div>
        </div>
      </Section>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <Section title="Barra de progresso (segmentos)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          {[3, 7, 11].map(active => (
            <div key={active}>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                Passo {active} de 16
              </p>
              <div className="progress-bar">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className={`progress-step${i < active ? ' is-complete' : i === active ? ' is-active' : ''}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Category cards ──────────────────────────────────────────────────── */}
      <Section title="Cards de categoria">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--card-gap)' }}>
          {categories.slice(0, 4).map(cat => (
            <div key={cat.id} className={`category-card category-card--${cat.id}`}>
              <div className="category-card__icon">
                <svg width="var(--icon-size)" height="var(--icon-size)" viewBox="0 0 24 24"
                  fill="none" stroke={cat.icon}
                  strokeWidth="var(--icon-stroke)" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l2 2" />
                </svg>
              </div>
              <div className="category-card__label">
                <p className="category-card__title">{cat.label}</p>
                <p className="category-card__subtitle">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Budget card ─────────────────────────────────────────────────────── */}
      <Section title="Budget card">
        <div className="budget-card" style={{ maxWidth: 480 }}>
          <div className="budget-card__header">
            <div style={{ width: 'var(--icon-container-size)', height: 'var(--icon-container-size)', borderRadius: 'var(--radius-icon)', background: 'var(--cat-cozinha-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cat-cozinha-icon)" strokeWidth="1.4" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
              </svg>
            </div>
            <span className="budget-card__category">Pavimento</span>
          </div>
          {[
            { name: 'Mosaico cerâmico', range: '175 – 360 €' },
            { name: 'Argamassa colante', range: '39 – 50 €' },
            { name: 'Assentamento (m.o.)', range: '162 – 234 €' },
          ].map(item => (
            <div key={item.name} className="budget-item">
              <span className="budget-item__name">{item.name}</span>
              <span className="budget-item__range">{item.range}</span>
            </div>
          ))}
          <div className="budget-total">
            <span className="budget-total__label">Subtotal Pavimento</span>
            <span className="budget-total__value">376 – 644 €</span>
          </div>
        </div>
      </Section>

      {/* ── Token reference ─────────────────────────────────────────────────── */}
      <Section title="Tokens — Raios, espaçamento e animações">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
          <div>
            <TokenRow name="--radius-card"     value="16px" />
            <TokenRow name="--radius-button"   value="12px" />
            <TokenRow name="--radius-input"    value="10px" />
            <TokenRow name="--radius-badge"    value="999px" />
            <TokenRow name="--radius-progress" value="2px" />
          </div>
          <div>
            <TokenRow name="--transition-fast" value="0.10s ease" />
            <TokenRow name="--transition-base" value="0.15s ease" />
            <TokenRow name="--transition-card" value="0.20s ease" />
            <TokenRow name="--transition-slow" value="0.30s ease" />
            <TokenRow name="--space-4 / 8 / 12" value="16px / 32px / 48px" />
          </div>
        </div>
      </Section>

    </div>
  );
}
