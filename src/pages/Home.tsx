import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { categories } from '../styles/tokens';
import type { Region, Project } from '../types';

const REGIONS: { value: Region; label: string }[] = [
  { value: 'Norte',     label: 'Norte' },
  { value: 'Centro',    label: 'Centro' },
  { value: 'LisboaSul', label: 'Lisboa e Sul' },
];

const QUESTIONNAIRE_ROUTE: Partial<Record<typeof categories[number]['id'], string>> = {
  cozinha:   'kitchen',
  casabanho: 'bathroom',
};

const CATEGORY_PATH: Record<string, React.ReactNode> = {
  cozinha: (
    <>
      <path d="M6 2v4M12 2v4M18 2v4" />
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 11h18" />
    </>
  ),
  casabanho: (
    <>
      <path d="M4 12h16a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2z" />
      <path d="M6 12V5a2 2 0 0 1 2-2h1" />
      <circle cx="10" cy="5" r="1" />
    </>
  ),
  pintura: (
    <>
      <path d="M3 21v-3l11-11 3 3L6 21H3z" />
      <path d="M14.5 6.5l3 3" />
      <path d="M16 2l6 6-2 2" />
    </>
  ),
  pavimentos: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  eletricidade: (
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  ),
  canalizacao: (
    <>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3c.5 3.5 3 4.06 3 7 0 2.5-2 4-3.5 4" />
    </>
  ),
  janelas: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 12h18M12 3v18" />
    </>
  ),
  jardim: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  outros: (
    <>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </>
  ),
};

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

export default function Home() {
  const location = useLocation();
  const project = (location.state as { project?: Project } | null)?.project;

  const [region, setRegion] = useState<Region>(project?.region ?? 'Norte');
  const navigate = useNavigate();

  const hasProject = !!project && project.divisions.length > 0;
  const activeRegion: Region = hasProject ? project!.region : region;
  const projectTotal = project?.divisions.reduce((sum, d) => sum + d.budget.totalPrice, 0) ?? 0;

  const handleCategoryClick = (catId: typeof categories[number]['id']) => {
    const routeId = QUESTIONNAIRE_ROUTE[catId];
    if (!routeId) return;

    const activeProject: Project = project ?? { region: activeRegion, divisions: [] };
    navigate(`/questionario/${routeId}?region=${activeProject.region}`, {
      state: { project: activeProject },
    });
  };

  return (
    <main style={hasProject ? { paddingBottom: 80 } : undefined}>
      {/* Hero */}
      <div className="screen-hero" style={{ textAlign: 'center' }}>
        <span className="badge-start">
          <span className="badge-start__dot" />
          {hasProject
            ? `Obra em curso · ${project!.divisions.length} ${project!.divisions.length === 1 ? 'divisão' : 'divisões'}`
            : 'Orçamentos gratuitos'
          }
        </span>

        <h1 className="hero-title" style={{ margin: '0 auto var(--space-6)' }}>
          {hasProject ? (
            <>Adicionar outra divisão</>
          ) : (
            <>O que está a planear<br />renovar?</>
          )}
        </h1>

        <p className="hero-body" style={{ margin: '0 auto var(--space-8)' }}>
          {hasProject
            ? 'Escolha a próxima divisão para incluir no orçamento da sua obra.'
            : 'Comece por uma divisão — pode juntar cozinha, casas de banho e mais na mesma obra.'
          }
        </p>

        {/* Region selector — apenas quando não há obra iniciada */}
        {!hasProject && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
            marginBottom: 'var(--space-10)',
          }}>
            <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Região:
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {REGIONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={`btn btn--sm ${region === r.value ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grelha de categorias */}
      <div className="categories-grid">
        {categories.map(cat => {
          const isAvailable = !!QUESTIONNAIRE_ROUTE[cat.id];
          return (
            <div
              key={cat.id}
              role={isAvailable ? 'button' : undefined}
              tabIndex={isAvailable ? 0 : undefined}
              onClick={() => isAvailable && handleCategoryClick(cat.id)}
              onKeyDown={e => { if (isAvailable && (e.key === 'Enter' || e.key === ' ')) handleCategoryClick(cat.id); }}
              className={`category-card category-card--${cat.id}`}
              style={!isAvailable ? { opacity: 0.5, cursor: 'default' } : undefined}
            >
              <div className="category-card__icon">
                <svg
                  width="var(--icon-size)" height="var(--icon-size)"
                  viewBox="0 0 24 24" fill="none"
                  stroke={cat.icon}
                  strokeWidth="var(--icon-stroke)"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  {CATEGORY_PATH[cat.id]}
                </svg>
              </div>
              <div className="category-card__label">
                <p className="category-card__title">
                  {cat.label}
                  {!isAvailable && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 500,
                      color: 'var(--color-text-tertiary)',
                      background: 'var(--color-bg-surface)',
                      padding: '2px 6px', borderRadius: 'var(--radius-badge)',
                    }}>
                      em breve
                    </span>
                  )}
                </p>
                <p className="category-card__subtitle">{cat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="footer-legal">
        Estimativas baseadas em preços médios de mercado 2024/2025 · Portugal Continental
      </p>

      {/* Friso fixo em baixo — resumo da obra em curso */}
      {hasProject && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border-card)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
          zIndex: 50,
          display: 'flex', alignItems: 'center',
          padding: '0 32px',
          height: 72,
          gap: 16,
        }}>
          {/* Label */}
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Obra em curso
          </span>

          {/* Separador */}
          <div style={{ width: 1, height: 32, background: 'var(--color-border-subtle)', flexShrink: 0 }} />

          {/* Chips de divisões */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
            {project!.divisions.map((d, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'var(--color-primary-bg)',
                borderRadius: 'var(--radius-badge)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--color-primary)', display: 'inline-block',
                }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(d.budget.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div style={{ width: 1, height: 32, background: 'var(--color-border-subtle)', flexShrink: 0 }} />

          {/* Total parcial */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1,
            }}>
              Total parcial
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: -0.3 }}>
              {fmt(projectTotal)}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/orcamento/obra', { state: { project } })}
            className="btn btn-primary"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Ver orçamento completo
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
