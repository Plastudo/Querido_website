import { useState } from 'react';
import type { Project, ProjectDivision, BudgetItem, Unit } from '../../types';
import type { PDFData } from '../../utils/exportPDF';
import { saveBudget, updateBudget } from '../../utils/storage';
import { useProtectedAction } from '../../hooks/useProtectedAction';

const REGION_MULTIPLIER = {
  Norte:     1.000,
  Centro:    1.075,
  LisboaSul: 1.175,
} as const;

const UNIT_LABEL: Record<Unit, string> = { m2: 'm²', ml: 'ml', un: 'un', hr: 'h', vb: 'vb' };

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

// ─── Inline editable cell ─────────────────────────────────────────────────────

interface CellInputProps {
  value: number;
  onChange: (v: string) => void;
  min?: number;
  step?: number;
}

function CellInput({ value, onChange, min = 0, step = 0.01 }: CellInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
      background: focused ? 'rgba(83,74,183,0.07)' : 'rgba(0,0,0,0.04)',
      border: `1.5px solid ${focused ? 'rgba(83,74,183,0.65)' : 'rgba(0,0,0,0.13)'}`,
      borderRadius: 7,
      padding: '5px 10px',
      transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
      boxShadow: focused ? '0 0 0 3px rgba(83,74,183,0.13)' : 'none',
      cursor: 'text',
    }}>
      {/* Lápis — visível quando não está em foco */}
      {!focused && (
        <svg
          width="10" height="10"
          fill="none" stroke="rgba(0,0,0,0.28)"
          viewBox="0 0 24 24" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="cell-input"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          textAlign: 'right',
          fontFamily: 'var(--font-family)',
          fontVariantNumeric: 'tabular-nums',
          padding: 0,
          outline: 'none',
          cursor: 'text',
        }}
      />
    </div>
  );
}

// ─── Ícone de lápis para cabeçalhos de colunas editáveis ─────────────────────

function EditableColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
      <svg
        width="9" height="9"
        fill="none" stroke="currentColor"
        viewBox="0 0 24 24" strokeWidth={2.3}
        strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: 0.55, flexShrink: 0 }}
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      {children}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: Project;
  savedBudgetId?: string;
  onBack?: (editedProject: Project) => void;
  onAddDivision?: (editedProject: Project) => void;
  onPreview?: (data: PDFData) => void;
}

// ─── Deep-copy helper ─────────────────────────────────────────────────────────

function cloneDivisions(divisions: ProjectDivision[]): ProjectDivision[] {
  return divisions.map(d => ({
    ...d,
    budget: {
      ...d.budget,
      sections: d.budget.sections.map(s => ({
        ...s,
        items: s.items.map(i => ({ ...i })),
      })),
    },
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConsolidatedBudgetView({ project, savedBudgetId, onBack, onAddDivision, onPreview }: Props) {
  const { region } = project;
  const multiplier = REGION_MULTIPLIER[region] ?? 1;
  const { withAuth } = useProtectedAction();

  const [divisions, setDivisions] = useState<ProjectDivision[]>(() => cloneDivisions(project.divisions));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saveMode, setSaveMode] = useState<'idle' | 'choosing' | 'saved'>('idle');
  // true logo que o utilizador edita um campo; false ao carregar e após guardar
  const [isDirty, setIsDirty] = useState(false);

  // ── Mutação de itens ─────────────────────────────────────────────────────────

  const updateItem = (di: number, si: number, ii: number, patch: Partial<BudgetItem>) => {
    setIsDirty(true);
    setDivisions(prev => prev.map((div, dIdx) => {
      if (dIdx !== di) return div;
      const newSections = div.budget.sections.map((section, sIdx) => {
        if (sIdx !== si) return section;
        return {
          ...section,
          items: section.items.map((item, iIdx) => {
            if (iIdx !== ii) return item;
            const next = { ...item, ...patch };
            next.totalPrice = next.quantity * next.unitPrice;
            return next;
          }),
        };
      });
      const newTotal = newSections.flatMap(s => s.items).reduce((sum, i) => sum + i.totalPrice, 0);
      return { ...div, budget: { sections: newSections, totalPrice: newTotal } };
    }));
  };

  // ── Totais reativos ──────────────────────────────────────────────────────────

  const allItems      = divisions.flatMap(d => d.budget.sections.flatMap(s => s.items));
  const grandTotal    = allItems.reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
  const materialTotal = allItems.filter(i => i.category === 'material').reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
  const laborTotal    = grandTotal - materialTotal;
  const materialPct   = grandTotal > 0 ? Math.round((materialTotal / grandTotal) * 100) : 0;
  const laborPct      = grandTotal > 0 ? Math.round((laborTotal    / grandTotal) * 100) : 0;

  const divisionCount = divisions.length;
  const title = divisionCount === 1
    ? `Orçamento ${divisions[0].label}`
    : `Obra Completa · ${divisionCount} divisões`;

  // ── Callbacks ────────────────────────────────────────────────────────────────

  const editedProject: Project = { region, divisions };

  const handlePreview = () => {
    const sections = divisions.flatMap(d =>
      d.budget.sections.map(s => ({
        ...s,
        title: divisionCount > 1 ? `${d.label} · ${s.title}` : s.title,
        items: s.items.map(i => ({ ...i })),
      }))
    );
    onPreview?.({ sections, title, region, multiplier, materialTotal, laborTotal, grandTotal });
  };

  const confirmSaved = () => {
    setIsDirty(false);
    setSaveMode('saved');
    setTimeout(() => setSaveMode('idle'), 2500);
  };

  const handleSaveClick = () => {
    if (savedBudgetId) {
      setSaveMode('choosing');
    } else {
      saveBudget(editedProject, title, grandTotal);
      confirmSaved();
    }
  };

  const handleUpdate = () => {
    updateBudget(savedBudgetId!, editedProject, title, grandTotal);
    confirmSaved();
  };

  const handleSaveAsNew = () => {
    saveBudget(editedProject, title, grandTotal);
    confirmSaved();
  };

  const toggleCollapse = (key: string) =>
    setCollapsed(c => ({ ...c, [key]: !c[key] }));

  // ── Estilos partilhados ──────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
  };

  const thStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--color-bg-surface)', minHeight: '100vh', fontFamily: 'var(--font-family)', paddingBottom: 80 }}>

      {/* ── Cabeçalho da página ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-subtle)', padding: '20px 64px 24px' }}>
        {onBack && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onBack(editedProject)}
              style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-family)', transition: 'color var(--transition-base)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            >
              ← Início
            </button>
            <span style={{ color: 'var(--color-border-subtle)', fontSize: 'var(--text-label-size)' }}>/</span>
            <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)' }}>{title}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 500, letterSpacing: -0.8, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.1 }}>{title}</h1>
            <p style={{ marginTop: 8, fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)' }}>
              Estimativa · {region} · preços médios 2024/2025
            </p>
          </div>
          <button onClick={handlePreview} className="btn btn-secondary btn--sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Pré-visualizar
          </button>
        </div>
      </div>

      {/* ── Cartões de resumo ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--card-gap)', padding: '32px 64px' }}>

        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round"><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="9" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Orçamento total</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>{fmt(grandTotal)}</div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>{divisionCount} {divisionCount === 1 ? 'divisão' : 'divisões'}</div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--cat-eletricidade-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="var(--cat-eletricidade-icon)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Material</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>{fmt(materialTotal)}</div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>{materialPct}% do total</div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--cat-casabanho-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="var(--cat-casabanho-icon)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Mão-de-obra</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>{fmt(laborTotal)}</div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>{laborPct}% do total</div>
          </div>
        </div>

      </div>

      {/* ── Cartões por divisão ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 64px', display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
        {divisions.map((division, di) => {
          const divItems    = division.budget.sections.flatMap(s => s.items);
          const divTotal    = divItems.reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
          const divMaterial = divItems.filter(i => i.category === 'material').reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
          const divLabor    = divTotal - divMaterial;
          const isCollapsed = collapsed[division.workType] ?? false;

          return (
            <div key={division.workType} style={cardStyle}>

              {/* ── Cabeçalho da divisão ──────────────────────────────────── */}
              <button
                onClick={() => toggleCollapse(division.workType)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 28px',
                  background: 'var(--color-primary-bg)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(83,74,183,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary-bg)')}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>
                    Divisão {di + 1}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', letterSpacing: -0.3 }}>
                    {division.label}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                    {divItems.length} {divItems.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 5 }}>Subtotal</div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: -0.5 }}>
                      {fmt(divTotal)}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24"
                    style={{ transition: 'transform var(--transition-base)', transform: isCollapsed ? 'rotate(-90deg)' : 'none', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* ── Corpo da divisão ──────────────────────────────────────── */}
              {!isCollapsed && (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{
                        borderTop: '1px solid var(--color-border-subtle)',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        background: 'var(--color-bg-surface)',
                      }}>
                        <th style={{ ...thStyle, textAlign: 'left',   padding: '10px 12px 10px 28px', width: '42%' }}>Descrição</th>
                        <th style={{ ...thStyle, textAlign: 'center', padding: '10px 12px',           width: '8%'  }}>Unid.</th>
                        <th style={{ ...thStyle, padding: '10px 12px', width: '14%' }}>
                          <EditableColHeader>Quant.</EditableColHeader>
                        </th>
                        <th style={{ ...thStyle, padding: '10px 12px', width: '18%' }}>
                          <EditableColHeader>Preço un.</EditableColHeader>
                        </th>
                        <th style={{ ...thStyle, textAlign: 'right',  padding: '10px 28px 10px 12px', width: '18%' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {division.budget.sections.map((section, si) => (
                        <>
                          {/* Separador de secção */}
                          <tr key={`s-${si}`} style={{ background: 'rgba(29,29,31,0.025)' }}>
                            <td colSpan={5} style={{
                              padding: '7px 28px',
                              fontSize: 10.5, fontWeight: 700,
                              color: 'var(--color-text-tertiary)',
                              textTransform: 'uppercase', letterSpacing: '0.07em',
                              borderTop: si > 0 ? '1px solid var(--color-border-subtle)' : undefined,
                            }}>
                              {section.title}
                            </td>
                          </tr>

                          {/* Itens */}
                          {section.items.map((item, ii) => (
                            <tr
                              key={`i-${si}-${ii}`}
                              style={{
                                borderBottom: '1px solid var(--color-border-subtle)',
                                background: ii % 2 === 1 ? 'rgba(249,248,246,0.6)' : undefined,
                              }}
                            >
                              {/* Descrição */}
                              <td style={{ padding: '9px 12px 9px 28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{
                                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                    background: item.category === 'material' ? 'rgb(138, 106, 59)' : 'var(--color-primary)',
                                  }} />
                                  <span style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                                </div>
                              </td>

                              {/* Unidade */}
                              <td style={{ padding: '9px 12px', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: 13 }}>
                                {UNIT_LABEL[item.unit] ?? item.unit}
                              </td>

                              {/* Quantidade — editável */}
                              <td style={{ padding: '5px 8px' }}>
                                {item.editableFields.includes('quantity') ? (
                                  <CellInput
                                    value={item.quantity}
                                    min={0}
                                    step={0.01}
                                    onChange={v => updateItem(di, si, ii, { quantity: parseFloat(v) || 0 })}
                                  />
                                ) : (
                                  <span style={{ display: 'block', textAlign: 'right', padding: '5px 10px', color: 'var(--color-text-secondary)' }}>
                                    {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                                  </span>
                                )}
                              </td>

                              {/* Preço unitário — editável (valor com multiplicador regional) */}
                              <td style={{ padding: '5px 8px' }}>
                                {item.editableFields.includes('unitPrice') ? (
                                  <CellInput
                                    value={parseFloat((item.unitPrice * multiplier).toFixed(2))}
                                    min={0}
                                    step={0.01}
                                    onChange={v => updateItem(di, si, ii, { unitPrice: (parseFloat(v) || 0) / multiplier })}
                                  />
                                ) : (
                                  <span style={{ display: 'block', textAlign: 'right', padding: '5px 10px', color: 'var(--color-text-secondary)' }}>
                                    {fmt(item.unitPrice * multiplier)}
                                  </span>
                                )}
                              </td>

                              {/* Total da linha — calculado, não editável */}
                              <td style={{
                                padding: '9px 28px 9px 12px',
                                textAlign: 'right',
                                fontWeight: 600,
                                fontSize: 15,
                                color: 'var(--color-text-primary)',
                                whiteSpace: 'nowrap',
                              }}>
                                {fmt(item.totalPrice * multiplier)}
                              </td>
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>

                  {/* ── Rodapé da divisão ────────────────────────────────── */}
                  <div style={{
                    borderTop: '2px solid var(--color-border-subtle)',
                    padding: '14px 28px',
                    background: 'var(--color-primary-bg)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(138, 106, 59)', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          Materiais: <strong style={{ color: 'var(--color-text-primary)' }}>{fmt(divMaterial)}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          Mão-de-obra: <strong style={{ color: 'var(--color-text-primary)' }}>{fmt(divLabor)}</strong>
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Total {division.label}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: -0.4 }}>
                        {fmt(divTotal)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Rodapé fixo ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex', alignItems: 'center',
        padding: '0 64px', height: 64, zIndex: 10,
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-muted)' }}>Total estimado</span>
          <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.5, color: 'var(--color-text-primary)' }}>
            {fmt(grandTotal)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {onAddDivision && (
            <button
              className="btn btn-secondary"
              onClick={() => withAuth(() => onAddDivision(editedProject))}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Adicionar divisão
            </button>
          )}
          {/* Guardar — com popover de escolha quando é orçamento já guardado */}
          <div style={{ position: 'relative' }}>

            {saveMode === 'choosing' && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                right: 0,
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-card)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                overflow: 'hidden',
                minWidth: 240,
                zIndex: 50,
              }}>
                <div style={{ padding: '10px 14px 8px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  Guardar alterações como…
                </div>
                <button
                  onClick={handleUpdate}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-family)',
                    transition: 'background var(--transition-fast)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.65" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>Atualizar orçamento</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>Substitui o orçamento guardado</div>
                  </div>
                </button>
                <button
                  onClick={handleSaveAsNew}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-family)',
                    transition: 'background var(--transition-fast)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" fill="none" stroke="var(--color-text-secondary)" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>Guardar como novo</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 1 }}>Cria uma cópia independente</div>
                  </div>
                </button>
                <button
                  onClick={() => setSaveMode('idle')}
                  style={{
                    width: '100%', padding: '9px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-family)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  Cancelar
                </button>
              </div>
            )}

            <button
              className={saveMode === 'saved' ? 'btn btn-secondary' : 'btn btn-primary'}
              onClick={() => withAuth(handleSaveClick)}
              disabled={!!savedBudgetId && !isDirty && saveMode === 'idle'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'opacity 0.2s',
                opacity: (!!savedBudgetId && !isDirty && saveMode === 'idle') ? 0.4 : undefined,
                cursor: (!!savedBudgetId && !isDirty && saveMode === 'idle') ? 'not-allowed' : undefined,
              }}
            >
              {saveMode === 'saved' ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Guardado
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Guardar
                </>
              )}
            </button>
          </div>
          <button
            disabled
            className="btn btn-secondary"
            style={{ opacity: 0.45, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Pedir orçamentos
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'rgba(0,0,0,0.07)',
              borderRadius: 4,
              padding: '2px 5px',
            }}>
              em breve
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
