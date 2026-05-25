import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDivisions, type Division } from '../hooks/useDivisions';
import { ICON_PATHS } from '../config/divisionIcons';
import type { Region, Project } from '../types';

const REGIONS: { value: Region; label: string }[] = [
  { value: 'Norte',     label: 'Norte' },
  { value: 'Centro',    label: 'Centro' },
  { value: 'LisboaSul', label: 'Lisboa e Sul' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

export default function Home() {
  const location = useLocation();
  const project = (location.state as { project?: Project } | null)?.project;
  const [region, setRegion] = useState<Region>(project?.region ?? 'Norte');
  const navigate = useNavigate();
  const { divisions, isLoading } = useDivisions();

  const hasProject = !!project && project.divisions.length > 0;
  const activeRegion: Region = hasProject ? project!.region : region;
  const projectTotal = project?.divisions.reduce((sum, d) => sum + d.budget.totalPrice, 0) ?? 0;

  const handleCategoryClick = (div: Division) => {
    if (!div.prefix) return;
    const activeProject: Project = project ?? { region: activeRegion, divisions: [] };
    navigate(`/questionario-v2/${div.prefix}?region=${activeProject.region}`, {
      state: { project: activeProject, categoryLabel: div.label },
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
        {isLoading
          ? [...Array(10)].map((_, i) => (
              <div key={i} className="category-card" style={{ opacity: 0.4, pointerEvents: 'none' }} />
            ))
          : divisions.map(div => {
              const isAvailable = !!div.prefix;
              return (
                <div
                  key={div.id}
                  role={isAvailable ? 'button' : undefined}
                  tabIndex={isAvailable ? 0 : undefined}
                  onClick={() => isAvailable && handleCategoryClick(div)}
                  onKeyDown={e => { if (isAvailable && (e.key === 'Enter' || e.key === ' ')) handleCategoryClick(div); }}
                  className={`category-card category-card--${div.icon_type}`}
                  style={!isAvailable ? { opacity: 0.5, cursor: 'default' } : undefined}
                >
                  <div className="category-card__icon" style={{ background: div.bg_color }}>
                    <svg
                      width="var(--icon-size)" height="var(--icon-size)"
                      viewBox="0 0 24 24" fill="none"
                      stroke={div.icon_color}
                      strokeWidth="var(--icon-stroke)"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      {ICON_PATHS[div.icon_type] ?? ICON_PATHS['outros']}
                    </svg>
                  </div>
                  <div className="category-card__label">
                    <p className="category-card__title">
                      {div.label}
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
                    <p className="category-card__subtitle">{div.subtitle}</p>
                  </div>
                </div>
              );
            })
        }
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
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Obra em curso
          </span>
          <div style={{ width: 1, height: 32, background: 'var(--color-border-subtle)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
            {project!.divisions.map((d, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'var(--color-primary-bg)',
                borderRadius: 'var(--radius-badge)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)' }}>{d.label}</span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(d.budget.totalPrice)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--color-border-subtle)', flexShrink: 0 }} />
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
