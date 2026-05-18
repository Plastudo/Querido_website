import { useState, useCallback } from 'react';
import type { Budget, BudgetItem, BudgetSection, BudgetCategory, Unit, Region } from '../../types';
import type { PDFData } from '../../utils/exportPDF';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialBudget: Budget;
  title?: string;
  region?: Region;
  multiplier?: number;
  onChange?: (budget: Budget) => void;
  onNew?: () => void;
  onAddDivision?: () => void;
  onPreview?: (data: PDFData) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UNITS: Unit[] = ['m2', 'ml', 'un', 'hr', 'vb'];
const UNIT_LABEL: Record<Unit, string> = { m2: 'm²', ml: 'ml', un: 'un', hr: 'h', vb: 'vb' };
const CATEGORIES: BudgetCategory[] = ['material', 'labor'];

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

let _idCounter = 0;
const newId = () => `new_${Date.now()}_${++_idCounter}`;

function blankItem(): BudgetItem {
  return {
    id: newId(),
    category: 'material',
    name: '',
    unit: 'm2',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    editableFields: ['quantity', 'unitPrice'],
  };
}

function recalcBudget(sections: BudgetSection[]): Budget {
  const totalPrice = sections.reduce(
    (sum, s) => sum + s.items.reduce((s2, i) => s2 + i.totalPrice, 0),
    0,
  );
  return { sections, totalPrice };
}

function sectionIconStyle(section: BudgetSection): { bg: string; stroke: string } {
  const laborCount = section.items.filter(i => i.category === 'labor').length;
  const total = section.items.length;
  if (total === 0) return { bg: 'var(--color-primary-bg)', stroke: 'var(--color-primary)' };
  if (laborCount / total > 0.5)
    return { bg: 'var(--cat-casabanho-bg)', stroke: 'var(--cat-casabanho-icon)' };
  return { bg: 'var(--cat-eletricidade-bg)', stroke: 'var(--cat-eletricidade-icon)' };
}

// ─── Cell input ───────────────────────────────────────────────────────────────

interface CellInputProps {
  value: string | number;
  type?: 'text' | 'number';
  onChange: (v: string) => void;
  placeholder?: string;
  align?: 'left' | 'right';
  min?: number;
  step?: number;
}

function CellInput({ value, type = 'text', onChange, placeholder, align = 'left', min, step }: CellInputProps) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-transparent border-0 border-b border-transparent focus:border-[var(--color-border-focus)] focus:outline-none py-1 transition-colors`}
      style={{
        fontSize: 15,
        color: 'var(--color-text-primary)',
        textAlign: align,
        fontFamily: 'var(--font-family)',
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BudgetView({
  initialBudget,
  title = 'Orçamento de Obras',
  region = 'Norte',
  multiplier = 1,
  onChange,
  onNew,
  onAddDivision,
  onPreview,
}: Props) {
  const [sections, setSections] = useState<BudgetSection[]>(() =>
    initialBudget.sections.map(s => ({
      ...s,
      items: s.items.map(i => ({ ...i })),
    })),
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // ── Mutations ───────────────────────────────────────────────────────────────

  const commit = useCallback((next: BudgetSection[]) => {
    setSections(next);
    onChange?.(recalcBudget(next));
  }, [onChange]);

  const updateItem = (si: number, ii: number, patch: Partial<BudgetItem>) => {
    const next = sections.map((s, sIdx) => {
      if (sIdx !== si) return s;
      return {
        ...s,
        items: s.items.map((item, iIdx) => {
          if (iIdx !== ii) return item;
          const updated = { ...item, ...patch };
          updated.totalPrice = updated.quantity * updated.unitPrice;
          return updated;
        }),
      };
    });
    commit(next);
  };

  const deleteItem = (si: number, ii: number) => {
    const next = sections.map((s, sIdx) => {
      if (sIdx !== si) return s;
      return { ...s, items: s.items.filter((_, iIdx) => iIdx !== ii) };
    });
    commit(next);
  };

  const addItem = (si: number) => {
    const next = sections.map((s, sIdx) => {
      if (sIdx !== si) return s;
      return { ...s, items: [...s.items, blankItem()] };
    });
    commit(next);
  };

  const toggleCollapse = (title: string) =>
    setCollapsed(c => ({ ...c, [title]: !c[title] }));

  // ── Derived totals ──────────────────────────────────────────────────────────

  const grandTotal = sections.reduce(
    (sum, s) => sum + s.items.reduce((s2, i) => s2 + i.totalPrice * multiplier, 0), 0,
  );
  const materialTotal = sections.reduce(
    (sum, s) => sum + s.items.filter(i => i.category === 'material')
      .reduce((s2, i) => s2 + i.totalPrice * multiplier, 0), 0,
  );
  const laborTotal = sections.reduce(
    (sum, s) => sum + s.items.filter(i => i.category === 'labor')
      .reduce((s2, i) => s2 + i.totalPrice * multiplier, 0), 0,
  );

  const materialPct = grandTotal > 0 ? Math.round((materialTotal / grandTotal) * 100) : 0;
  const laborPct    = grandTotal > 0 ? Math.round((laborTotal    / grandTotal) * 100) : 0;

  // ── Shared styles ───────────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-card)',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      minHeight: '100vh',
      fontFamily: 'var(--font-family)',
      paddingBottom: 80,
    }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '20px 64px 24px',
      }}>
        {onNew && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onNew}
              style={{
                fontSize: 'var(--text-label-size)',
                color: 'var(--color-text-tertiary)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                transition: 'color var(--transition-base)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            >
              ← Início
            </button>
            <span style={{ color: 'var(--color-border-subtle)', fontSize: 'var(--text-label-size)' }}>/</span>
            <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)' }}>
              {title}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <h1 style={{
              fontSize: 36, fontWeight: 500, letterSpacing: -0.8,
              color: 'var(--color-text-primary)',
              margin: 0, lineHeight: 1.1,
            }}>
              {title}
            </h1>
            <p style={{ marginTop: 8, fontSize: 'var(--text-label-size)', color: 'var(--color-text-secondary)' }}>
              Estimativa · {region} · preços médios 2024/2025
            </p>
          </div>
          <button
            onClick={() => onPreview?.({ sections, title, region, multiplier, materialTotal, laborTotal, grandTotal })}
            className="btn btn-secondary btn--sm"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Pré-visualizar
          </button>
        </div>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 'var(--card-gap)',
        padding: '32px 64px',
      }}>
        {/* Total */}
        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round">
              <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Orçamento total
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {fmt(grandTotal)}
            </div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
              Estimativa atual
            </div>
          </div>
        </div>

        {/* Materials */}
        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'var(--cat-eletricidade-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="var(--cat-eletricidade-icon)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Material
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {fmt(materialTotal)}
            </div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
              {materialPct}% do total
            </div>
          </div>
        </div>

        {/* Labor */}
        <div style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'var(--cat-casabanho-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="var(--cat-casabanho-icon)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Mão-de-obra
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {fmt(laborTotal)}
            </div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--color-text-muted)' }}>
              {laborPct}% do total
            </div>
          </div>
        </div>
      </div>

      {/* ── Table sections ────────────────────────────────────────────────── */}
      <div style={{ padding: '0 64px', display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
        {sections.map((section, si) => {
          const isCollapsed = collapsed[section.title] ?? false;
          const sectionTotal = section.items.reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
          const { bg: iconBg, stroke: iconStroke } = sectionIconStyle(section);

          return (
            <div key={section.title} style={cardStyle}>

              {/* Section header */}
              <button
                onClick={() => toggleCollapse(section.title)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 28px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" fill="none" stroke={iconStroke} viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>

                {/* Title + count */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)', letterSpacing: -0.2 }}>
                    {section.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    {section.items.length} {section.items.length === 1 ? 'linha' : 'linhas'}
                  </div>
                </div>

                {/* Total + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {fmt(sectionTotal)}
                  </span>
                  <svg width="16" height="16" fill="none" stroke="var(--color-text-tertiary)" viewBox="0 0 24 24"
                    style={{ transition: 'transform var(--transition-base)', transform: isCollapsed ? 'rotate(-90deg)' : 'none', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Section body */}
              {!isCollapsed && (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                    <thead>
                      <tr style={{
                        borderTop: '1px solid var(--color-border-subtle)',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        background: 'var(--color-bg-surface)',
                        fontSize: 11,
                        color: 'var(--color-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        <th style={{ textAlign: 'left',  padding: '10px 12px 10px 28px', fontWeight: 500, width: '38%' }}>Descrição</th>
                        <th style={{ textAlign: 'left',  padding: '10px 12px', fontWeight: 500, width: '8%'  }}>Tipo</th>
                        <th style={{ textAlign: 'left',  padding: '10px 12px', fontWeight: 500, width: '8%'  }}>Unid.</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 500, width: '12%' }}>Quant.</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 500, width: '15%' }}>Preço un.</th>
                        <th style={{ textAlign: 'right', padding: '10px 28px 10px 12px', fontWeight: 500, width: '15%' }}>Total</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{
                            padding: 'var(--space-5)',
                            textAlign: 'center',
                            fontSize: 'var(--text-label-size)',
                            color: 'var(--color-text-muted)',
                          }}>
                            Nenhum item. Adiciona uma linha abaixo.
                          </td>
                        </tr>
                      )}
                      {section.items.map((item, ii) => (
                        <tr
                          key={item.id}
                          className="group"
                          style={{
                            borderBottom: '1px solid var(--color-border-subtle)',
                            transition: 'background var(--transition-fast)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          {/* Name */}
                          <td style={{ padding: '4px 12px 4px 28px' }}>
                            <CellInput
                              value={item.name}
                              placeholder="Nome do item"
                              onChange={v => updateItem(si, ii, { name: v })}
                            />
                          </td>
                          {/* Category */}
                          <td style={{ padding: '4px 12px' }}>
                            <select
                              value={item.category}
                              onChange={e => updateItem(si, ii, { category: e.target.value as BudgetCategory })}
                              className="w-full bg-transparent border-b border-transparent focus:border-[var(--color-border-focus)] focus:outline-none cursor-pointer py-1"
                              style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family)' }}
                            >
                              {CATEGORIES.map(c => (
                                <option key={c} value={c}>
                                  {c === 'material' ? 'Material' : 'M. obra'}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* Unit */}
                          <td style={{ padding: '4px 12px' }}>
                            <select
                              value={item.unit}
                              onChange={e => updateItem(si, ii, { unit: e.target.value as Unit })}
                              className="w-full bg-transparent border-b border-transparent focus:border-[var(--color-border-focus)] focus:outline-none cursor-pointer py-1"
                              style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family)' }}
                            >
                              {UNITS.map(u => (
                                <option key={u} value={u}>{UNIT_LABEL[u]}</option>
                              ))}
                            </select>
                          </td>
                          {/* Quantity */}
                          <td style={{ padding: '4px 12px' }}>
                            <CellInput
                              type="number" align="right"
                              value={item.quantity} min={0} step={0.01}
                              onChange={v => updateItem(si, ii, { quantity: parseFloat(v) || 0 })}
                            />
                          </td>
                          {/* Unit price */}
                          <td style={{ padding: '4px 12px' }}>
                            <CellInput
                              type="number" align="right"
                              value={(item.unitPrice * multiplier).toFixed(2)} min={0} step={0.01}
                              onChange={v => updateItem(si, ii, { unitPrice: (parseFloat(v) || 0) / multiplier })}
                            />
                          </td>
                          {/* Total */}
                          <td style={{ padding: '4px 28px 4px 12px', textAlign: 'right', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                            {fmt(item.totalPrice * multiplier)}
                          </td>
                          {/* Delete */}
                          <td style={{ padding: '4px 12px 4px 0', textAlign: 'center' }}>
                            <button
                              onClick={() => deleteItem(si, ii)}
                              title="Eliminar linha"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                              style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color var(--transition-base)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add line */}
                  <div style={{
                    padding: '12px 28px',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}>
                    <button
                      onClick={() => addItem(si)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 500,
                        color: 'var(--color-primary)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        fontFamily: 'var(--font-family)',
                        transition: 'color var(--transition-base)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar linha
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex', alignItems: 'center',
        padding: '0 64px',
        height: 64,
        zIndex: 10,
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--color-text-muted)' }}>
            Total estimado
          </span>
          <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.5, color: 'var(--color-text-primary)' }}>
            {fmt(grandTotal)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">Guardar rascunho</button>
          {onAddDivision && (
            <button
              className="btn btn-secondary"
              onClick={onAddDivision}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Adicionar divisão
            </button>
          )}
          <button className="btn btn-primary">Pedir orçamentos</button>
        </div>
      </div>

    </div>
  );
}
