import { useLocation, useNavigate } from 'react-router-dom';
import { exportPDF, type PDFData } from '../utils/exportPDF';
import { useProtectedAction } from '../hooks/useProtectedAction';

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

const UNIT_LABEL: Record<string, string> = {
  m2: 'm²', ml: 'ml', un: 'un', hr: 'h', vb: 'vb',
};

function genRef(date: Date): string {
  const y = date.getFullYear();
  const seed = String((date.getMonth() + 1) * 10000 + date.getDate() * 100 + date.getHours()).padStart(6, '0');
  return `#QRD-${y}-${seed}`;
}

export default function BudgetPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { withAuth } = useProtectedAction();
  const data = state as PDFData | null;

  if (!data) {
    navigate('/', { replace: true });
    return null;
  }

  const { sections, title, region, multiplier, materialTotal, laborTotal, grandTotal } = data;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeLabel = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const ref = genRef(now);

  const slug = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const filename = `orcamento_${slug}_${now.toISOString().slice(0, 10)}.pdf`;

  const filledSections = sections.filter(s =>
    s.items.some(i => i.name.trim() || i.quantity > 0),
  );

  const C = {
    primary:   'rgb(83, 74, 183)',
    text:      'rgb(29, 29, 31)',
    textSec:   'rgba(29,29,31,0.55)',
    textTert:  'rgba(29,29,31,0.40)',
    surface:   'rgb(249, 248, 246)',
    border:    'rgba(29,29,31,0.09)',
    borderMid: 'rgba(29,29,31,0.12)',
    material:  'rgb(138, 106, 59)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(234, 234, 234)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-family)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        height: 52,
        gap: 16,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 14, color: C.textSec,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            transition: 'color var(--transition-base)',
            padding: 0,
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textSec)}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Pré-visualizar PDF
        </button>

        <span style={{ flex: 1, textAlign: 'center', fontSize: 12.5, color: C.textTert, letterSpacing: 0.1 }}>
          {filename} · 1 de 1
        </span>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn--sm"
          >
            Imprimir
          </button>
          <button
            onClick={() => withAuth(() => exportPDF(data))}
            className="btn btn-primary btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Descarregar
          </button>
        </div>
      </div>

      {/* ── Document ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 24px 72px' }}>
        <div style={{
          width: '100%', maxWidth: 794,
          background: '#fff',
          boxShadow: '0 2px 20px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: 3,
          overflow: 'hidden',
        }}>

          {/* ── Document header ─────────────────────────────────────────────── */}
          <div style={{
            padding: '28px 48px 26px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                textTransform: 'uppercase', color: C.primary, marginBottom: 5,
              }}>
                Orçamento
              </div>
              <div style={{ fontSize: 12, color: C.textTert, marginBottom: 10, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3 }}>
                {ref}
              </div>
              <div style={{ fontSize: 21, fontWeight: 600, color: C.text, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                {title}
              </div>
            </div>

            <div style={{ textAlign: 'right', paddingTop: 2 }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: C.primary, letterSpacing: '-0.3px' }}>
                Querido
              </div>
              <div style={{ fontSize: 11, color: C.textTert, marginTop: 3 }}>
                querido.pt
              </div>
            </div>
          </div>

          {/* ── Info bar ────────────────────────────────────────────────────── */}
          <div style={{
            padding: '14px 48px',
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 24,
          }}>
            {[
              { label: 'Localização', value: `${region}, Portugal` },
              { label: 'Data', value: dateLabel },
              { label: 'Tabela de preços', value: 'Médios de mercado 2024/2025' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: C.textTert, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Sections ────────────────────────────────────────────────────── */}
          <div style={{ padding: '28px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {filledSections.map(section => {
              const filledItems = section.items.filter(i => i.name.trim() || i.quantity > 0);
              const sectionTotal = filledItems.reduce((sum, i) => sum + i.totalPrice * multiplier, 0);
              const itemCount = filledItems.length;

              return (
                <div key={section.title}>
                  {/* Section label + badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: C.text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                    }}>
                      {section.title}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 500,
                      color: C.textTert,
                      background: 'rgba(29,29,31,0.06)',
                      padding: '2px 9px',
                      borderRadius: 99,
                    }}>
                      {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {/* Table */}
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 5, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{
                          background: C.surface,
                          borderBottom: `1px solid ${C.border}`,
                          fontSize: 9.5,
                          color: C.textTert,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                        }}>
                          <th style={{ textAlign: 'left',   padding: '8px 10px 8px 14px', width: '3%'  }}>#</th>
                          <th style={{ textAlign: 'left',   padding: '8px 10px',          width: '52%' }}>Descrição</th>
                          <th style={{ textAlign: 'center', padding: '8px 10px',          width: '8%'  }}>Unid.</th>
                          <th style={{ textAlign: 'right',  padding: '8px 10px',          width: '9%'  }}>Quant.</th>
                          <th style={{ textAlign: 'right',  padding: '8px 10px',          width: '14%' }}>Preço un.</th>
                          <th style={{ textAlign: 'right',  padding: '8px 14px 8px 10px', width: '14%' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filledItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: `1px solid ${C.border}`,
                              background: idx % 2 === 1 ? 'rgba(249,248,246,0.7)' : '#fff',
                            }}
                          >
                            <td style={{ padding: '8px 10px 8px 14px', color: C.textTert, textAlign: 'center', fontSize: 10 }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '8px 10px', color: C.text }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: 5, height: 5,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  background: item.category === 'material' ? C.material : C.primary,
                                }} />
                                {item.name || '—'}
                              </div>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', color: C.textSec }}>
                              {UNIT_LABEL[item.unit] ?? item.unit}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: C.textSec }}>
                              {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: C.textSec }}>
                              {fmt(item.unitPrice * multiplier)}
                            </td>
                            <td style={{ padding: '8px 14px 8px 10px', textAlign: 'right', fontWeight: 600, color: C.text }}>
                              {fmt(item.totalPrice * multiplier)}
                            </td>
                          </tr>
                        ))}
                        {/* Subtotal */}
                        <tr style={{ background: C.surface }}>
                          <td colSpan={4} />
                          <td style={{
                            padding: '9px 10px',
                            textAlign: 'right',
                            fontWeight: 600,
                            fontSize: 10.5,
                            color: C.textTert,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}>
                            Subtotal
                          </td>
                          <td style={{ padding: '9px 14px 9px 10px', textAlign: 'right', fontWeight: 700, color: C.primary, fontSize: 13 }}>
                            {fmt(sectionTotal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Summary ─────────────────────────────────────────────────────── */}
          <div style={{
            margin: '0 48px 40px',
            border: `1px solid ${C.borderMid}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 18px',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: C.material, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.textSec }}>Materiais</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.material }}>{fmt(materialTotal)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 18px',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.textSec }}>Mão-de-obra</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{fmt(laborTotal)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 18px',
              background: C.text,
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>Total geral</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Valores estimados, sem IVA</div>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
                {fmt(grandTotal)}
              </span>
            </div>
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────────────── */}
          <div style={{
            padding: '0 48px 20px',
            fontSize: 10,
            color: C.textTert,
            lineHeight: 1.6,
          }}>
            Os valores apresentados são estimativas baseadas em preços médios de mercado em Portugal.
            Os preços finais podem variar consoante a empresa contratada, materiais escolhidos e condições da obra.
          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            padding: '11px 48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
            color: C.textTert,
          }}>
            <span>Documento gerado em {dateLabel} às {timeLabel}</span>
            <span>Página 1 de 1 · querido.pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
