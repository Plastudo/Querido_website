import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAllDivisions, createDivision, updateDivision, deleteDivision,
  type Division, type DivisionInput,
} from '../../services/adminService';
import { ICON_PATHS, ICON_TYPES, ICON_LABELS } from '../../config/divisionIcons';

// ── Helpers ────────────────────────────────────────────────────────────────────

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return '#888888';
  return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const BLANK_DIVISION: DivisionInput = {
  prefix: null, label: '', subtitle: '', icon_type: 'sala',
  bg_color: 'rgb(238, 236, 230)', icon_color: 'rgb(100, 85, 55)',
  is_active: true, order_index: 99,
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const C = {
  bg: 'rgb(248, 247, 245)',
  bgCard: '#fff',
  border: 'rgba(29,29,31,0.09)',
  borderMid: 'rgba(29,29,31,0.14)',
  text: 'rgb(29, 29, 31)',
  textSec: 'rgba(29,29,31,0.6)',
  textTert: 'rgba(29,29,31,0.42)',
  primary: 'rgb(83, 74, 183)',
  primaryBg: 'rgba(83, 74, 183, 0.1)',
  danger: 'rgb(180, 45, 45)',
  dangerBg: 'rgba(180, 45, 45, 0.08)',
  header: 'rgb(22, 22, 24)',
};

// ── Division Card ──────────────────────────────────────────────────────────────

function DivisionCard({
  div, questionCount, onEdit, onEditQuestionnaire, onCreateQuestionnaire,
}: {
  div: Division;
  questionCount: number;
  onEdit: () => void;
  onEditQuestionnaire: () => void;
  onCreateQuestionnaire: () => void;
}) {
  const hasQuestionnaire = !!div.prefix;

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: div.bg_color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={div.icon_color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ICON_PATHS[div.icon_type] ?? ICON_PATHS['outros']}
        </svg>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{div.label}</span>
          {hasQuestionnaire ? (
            <span style={{
              fontSize: 10.5, fontWeight: 600, color: C.primary,
              background: C.primaryBg, padding: '2px 8px', borderRadius: 99,
              letterSpacing: '0.04em',
            }}>
              Prefixo {div.prefix}
            </span>
          ) : (
            <span style={{
              fontSize: 10.5, color: C.textTert,
              background: 'rgba(29,29,31,0.06)', padding: '2px 8px', borderRadius: 99,
            }}>
              Em breve
            </span>
          )}
          {!div.is_active && (
            <span style={{ fontSize: 10, color: C.textTert, background: 'rgba(29,29,31,0.05)', padding: '1px 6px', borderRadius: 99 }}>
              Oculta
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: C.textSec, marginTop: 2 }}>{div.subtitle}</div>
        {hasQuestionnaire && (
          <div style={{ fontSize: 11.5, color: C.textTert, marginTop: 3 }}>
            {questionCount > 0 ? `${questionCount} perguntas` : 'Sem perguntas ainda'}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {hasQuestionnaire ? (
          <button onClick={onEditQuestionnaire} style={{
            fontSize: 12.5, fontWeight: 500, color: C.primary,
            background: C.primaryBg, border: 'none', borderRadius: 8,
            padding: '7px 14px', cursor: 'pointer',
          }}>
            Editar QA →
          </button>
        ) : (
          <button onClick={onCreateQuestionnaire} style={{
            fontSize: 12.5, fontWeight: 500, color: C.textSec,
            background: 'rgba(29,29,31,0.06)', border: 'none', borderRadius: 8,
            padding: '7px 14px', cursor: 'pointer',
          }}>
            + Criar QA
          </button>
        )}
        <button onClick={onEdit} style={{
          fontSize: 12.5, color: C.textTert,
          background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
          padding: '7px 12px', cursor: 'pointer',
        }}>
          ⚙
        </button>
      </div>
    </div>
  );
}

// ── Division Modal ─────────────────────────────────────────────────────────────

function DivisionModal({
  initial, suggestedPrefix, onSave, onDelete, onClose,
}: {
  initial: DivisionInput & { id?: number };
  suggestedPrefix: string;
  onSave: (data: DivisionInput & { id?: number }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DivisionInput & { id?: number }>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.label.trim()) { setError('O nome é obrigatório.'); return; }
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm(`Eliminar a divisão "${form.label}"? Esta ação não pode ser desfeita.`)) return;
    setIsSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao eliminar');
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 13.5,
    border: `1px solid ${C.borderMid}`, borderRadius: 8,
    background: '#fff', color: C.text, fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.textTert,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    display: 'block', marginBottom: 5,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
            {form.id ? 'Editar Divisão' : 'Nova Divisão'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textTert }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} value={form.label}
              onChange={e => set('label', e.target.value)} placeholder="Ex: Escritório" />
          </div>

          {/* Descrição */}
          <div>
            <label style={labelStyle}>Descrição curta</label>
            <input style={inputStyle} value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)} placeholder="Ex: Móveis, iluminação, tomadas" />
          </div>

          {/* Prefixo */}
          <div>
            <label style={labelStyle}>Prefixo do questionário</label>
            <input style={{ ...inputStyle, width: 100 }} value={form.prefix ?? ''}
              onChange={e => set('prefix', e.target.value || null)}
              placeholder={suggestedPrefix} />
            <p style={{ margin: '4px 0 0', fontSize: 11.5, color: C.textTert }}>
              Deixar vazio = divisão sem questionário (mostra "Em breve"). Próximo sugerido: {suggestedPrefix}
            </p>
          </div>

          {/* Ícone */}
          <div>
            <label style={labelStyle}>Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICON_TYPES.map(type => (
                <button key={type} onClick={() => set('icon_type', type)}
                  title={ICON_LABELS[type]}
                  style={{
                    width: 44, height: 44, borderRadius: 9,
                    background: form.icon_type === type ? C.primaryBg : 'rgba(29,29,31,0.05)',
                    border: form.icon_type === type ? `2px solid ${C.primary}` : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={form.icon_type === type ? C.primary : C.textSec}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {ICON_PATHS[type]}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Cores */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <label style={labelStyle}>Cor de fundo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={rgbToHex(form.bg_color)}
                  onChange={e => set('bg_color', hexToRgb(e.target.value))}
                  style={{ width: 44, height: 36, padding: 2, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }} />
                <span style={{ fontSize: 12, color: C.textTert, fontFamily: 'monospace' }}>{form.bg_color}</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cor do ícone</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={rgbToHex(form.icon_color)}
                  onChange={e => set('icon_color', hexToRgb(e.target.value))}
                  style={{ width: 44, height: 36, padding: 2, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer' }} />
                <span style={{ fontSize: 12, color: C.textTert, fontFamily: 'monospace' }}>{form.icon_color}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.bg, borderRadius: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 9, background: form.bg_color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={form.icon_color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {ICON_PATHS[form.icon_type] ?? ICON_PATHS['outros']}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{form.label || 'Nome da divisão'}</div>
              <div style={{ fontSize: 11.5, color: C.textSec }}>{form.subtitle || 'Descrição curta'}</div>
            </div>
          </div>

          {/* Ordem + Ativa */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div>
              <label style={labelStyle}>Ordem</label>
              <input type="number" style={{ ...inputStyle, width: 80 }} value={form.order_index}
                onChange={e => set('order_index', parseInt(e.target.value) || 0)} />
            </div>
            <div style={{ paddingTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: C.text }}>
                <input type="checkbox" checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)} />
                Mostrar na homepage
              </label>
            </div>
          </div>
        </div>

        {error && (
          <p style={{ margin: '14px 0 0', fontSize: 13, color: C.danger, background: C.dangerBg, padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 10 }}>
          <div>
            {form.id && onDelete && (
              <button onClick={handleDelete} disabled={isSaving} style={{
                fontSize: 13, color: C.danger, background: C.dangerBg,
                border: 'none', borderRadius: 8, padding: '9px 14px', cursor: 'pointer',
              }}>
                Eliminar divisão
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              fontSize: 13.5, color: C.textSec, background: 'rgba(29,29,31,0.06)',
              border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={isSaving} style={{
              fontSize: 13.5, fontWeight: 600, color: '#fff',
              background: C.primary, border: 'none', borderRadius: 8,
              padding: '9px 20px', cursor: 'pointer',
              opacity: isSaving ? 0.6 : 1,
            }}>
              {isSaving ? 'A guardar…' : form.id ? 'Guardar' : 'Criar Divisão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<(DivisionInput & { id?: number }) | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const divs = await fetchAllDivisions();
      setDivisions(divs);

      // Fetch question counts per prefix
      const { supabase } = await import('../../lib/supabase');
      const prefixes = divs.filter(d => d.prefix).map(d => d.prefix!);
      const counts: Record<string, number> = {};
      await Promise.all(prefixes.map(async prefix => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .like('index', `${prefix}.%`);
        counts[prefix] = count ?? 0;
      }));
      setQuestionCounts(counts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const suggestedPrefix = String(
    Math.max(0, ...divisions.filter(d => d.prefix).map(d => parseInt(d.prefix!) || 0)) + 1
  );

  const handleSave = async (data: DivisionInput & { id?: number }) => {
    if (data.id) {
      const { id, ...payload } = data;
      await updateDivision(id, payload);
    } else {
      await createDivision(data);
    }
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteDivision(id);
    await load();
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div style={{
        background: C.header, color: '#fff',
        display: 'flex', alignItems: 'center', padding: '0 28px',
        height: 54, gap: 16,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← Site
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.03em' }}>Admin · Questionários</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{user?.email}</span>
        <button onClick={logout} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.6)', fontSize: 12.5, cursor: 'pointer',
          borderRadius: 7, padding: '5px 12px',
        }}>
          Sair
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>Divisões</h1>
          <button
            onClick={() => setModal({ ...BLANK_DIVISION, order_index: divisions.length + 1 })}
            style={{
              fontSize: 13.5, fontWeight: 600, color: '#fff', background: C.primary,
              border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            + Nova Divisão
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 78, background: 'rgba(29,29,31,0.06)', borderRadius: 12, animation: 'pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {divisions.map(div => (
              <DivisionCard
                key={div.id}
                div={div}
                questionCount={div.prefix ? (questionCounts[div.prefix] ?? 0) : 0}
                onEdit={() => setModal({ ...div })}
                onEditQuestionnaire={() => navigate(`/admin/editor/${div.prefix}`)}
                onCreateQuestionnaire={() => setModal({ ...div })}
              />
            ))}
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 12, color: C.textTert, textAlign: 'center' }}>
          Admin · {user?.email} · querido.pt
        </p>
      </div>

      {/* Modal */}
      {modal && (
        <DivisionModal
          initial={modal}
          suggestedPrefix={suggestedPrefix}
          onSave={handleSave}
          onDelete={modal.id ? () => handleDelete(modal.id!) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
