import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAdminQuestions, saveQuestion, deleteQuestion,
  type AdminQuestion, type AdminOption,
} from '../../services/adminService';

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
  success: 'rgb(35, 110, 50)',
  successBg: 'rgba(35, 110, 50, 0.09)',
  header: 'rgb(22, 22, 24)',
};

const TYPE_LABEL: Record<string, string> = {
  boolean: 'Sim/Não', choice: 'Escolha única', multi_choice: 'Escolha múltipla', numeric: 'Número', text: 'Texto',
};
const TYPE_COLOR: Record<string, string> = {
  boolean: 'rgba(83,74,183,0.13)', choice: 'rgba(83,74,183,0.08)',
  multi_choice: 'rgba(63,106,130,0.12)',
  numeric: 'rgba(35,110,50,0.1)', text: 'rgba(155,122,31,0.12)',
};

const UNIT_OPTIONS = [
  { value: '', label: 'Sem unidade' },
  { value: 'm2', label: 'm²' },
  { value: 'ml', label: 'ml (metro linear)' },
  { value: 'un', label: 'un (unidade)' },
  { value: 'vg', label: 'vg (verba global)' },
  { value: 'm3', label: 'm³' },
];

const inputCss: React.CSSProperties = {
  padding: '7px 10px', fontSize: 13.5, color: C.text,
  border: `1px solid ${C.borderMid}`, borderRadius: 8,
  background: '#fff', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
};
const labelCss: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, color: C.textTert,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  display: 'block', marginBottom: 4,
};

function blank(): AdminQuestion {
  return {
    index: '', text: '', type: 'choice', required: true,
    help_text: '', unit: '', order_index: 1, parent_index: '', next_question_index: '', options: [],
  };
}

function blankOption(): AdminOption {
  return {
    value: '', label: '', next_question_index: '', is_final_answer: false,
    order_index: 0, costs: { material: 0, labor: 0, overhead: 0 },
    quantity_formula: '', budget_description: '', budget_category: '',
    is_addon: false, addon_info: '', parent_option_id: null,
  };
}

function deepClone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

// ── Option Editor Row ──────────────────────────────────────────────────────────

function OptionRow({
  opt, idx, expanded, onToggle, onChange, onRemove, siblingOptions,
}: {
  opt: AdminOption;
  idx: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (changes: Partial<AdminOption>) => void;
  onRemove: () => void;
  siblingOptions: AdminOption[];
}) {
  const hasCosts = opt.costs.material > 0 || opt.costs.labor > 0;
  const summary = [
    opt.label || '(sem label)',
    hasCosts ? `Mat:${opt.costs.material} MO:${opt.costs.labor}` : '',
    opt.quantity_formula ? `Fórmula: ${opt.quantity_formula}` : '',
  ].filter(Boolean).join(' · ');

  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 10,
      overflow: 'hidden', background: C.bgCard,
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', cursor: 'pointer',
        background: expanded ? C.primaryBg : 'transparent',
      }} onClick={onToggle}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(29,29,31,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: C.textTert,
        }}>{idx + 1}</span>
        <span style={{ flex: 1, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {summary}
        </span>
        {opt.is_final_answer && (
          <span style={{ fontSize: 10, color: C.success, background: C.successBg, padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>
            Final
          </span>
        )}
        <span style={{ fontSize: 14, color: expanded ? C.primary : C.textTert, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.danger, fontSize: 16, padding: '0 2px', flexShrink: 0,
        }}>×</button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '14px 14px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Row 1: Label + Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelCss}>Label *</label>
              <input style={inputCss} value={opt.label}
                onChange={e => onChange({ label: e.target.value })}
                placeholder="Ex: Cerâmica nova" />
            </div>
            <div>
              <label style={labelCss}>Valor (interno) *</label>
              <input style={inputCss} value={opt.value}
                onChange={e => onChange({ value: e.target.value })}
                placeholder="Ex: new_ceramic" />
            </div>
          </div>

          {/* Row 2: Next question + flags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={labelCss}>Próxima pergunta (skip logic)</label>
              <input style={inputCss} value={opt.next_question_index}
                onChange={e => onChange({ next_question_index: e.target.value })}
                placeholder="Ex: 2.5 ou deixar vazio" />
            </div>
            <div style={{ paddingBottom: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: C.text, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={opt.is_final_answer}
                  onChange={e => onChange({ is_final_answer: e.target.checked })} />
                Resposta final
              </label>
            </div>
            <div style={{ paddingBottom: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: C.text, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={opt.is_addon}
                  onChange={e => onChange({ is_addon: e.target.checked })} />
                Add-on (checkbox)
              </label>
            </div>
          </div>

          {/* Tooltip info — available on all options */}
          <div>
            <label style={labelCss}>Texto do tooltip "?" (opcional)</label>
            <textarea
              style={{ ...inputCss, minHeight: 52, resize: 'vertical' }}
              value={opt.addon_info}
              onChange={e => onChange({ addon_info: e.target.value })}
              placeholder="Ex: O preço de afagar inclui verniz/vitrificação." />
          </div>

          {/* Parent option — only for add-ons */}
          {opt.is_addon && (
            <div>
              <label style={labelCss}>Aparece debaixo de qual opção? (add-on ligado)</label>
              <select
                style={{ ...inputCss, cursor: 'pointer' }}
                value={opt.parent_option_id ?? ''}
                onChange={e => onChange({ parent_option_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Global (extra para toda a pergunta)</option>
                {siblingOptions.filter(s => !s.is_addon && s.id).map(s => (
                  <option key={s.id} value={s.id}>{s.label || s.value}</option>
                ))}
              </select>
            </div>
          )}

          {/* Separator */}
          <div style={{ borderTop: `1px solid ${C.border}` }} />

          {/* Row 3: Costs */}
          <div>
            <label style={{ ...labelCss, marginBottom: 8 }}>Custos por unidade (€)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {(['material', 'labor', 'overhead'] as const).map(type => (
                <div key={type}>
                  <label style={{ ...labelCss, textTransform: 'none', fontSize: 11.5 }}>
                    {type === 'material' ? 'Material' : type === 'labor' ? 'Mão-de-obra' : 'Overhead'}
                  </label>
                  <input type="number" step="0.01" style={inputCss} value={opt.costs[type] || ''}
                    onChange={e => onChange({ costs: { ...opt.costs, [type]: parseFloat(e.target.value) || 0 } })}
                    placeholder="0.00" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Formula + Budget item */}
          <div>
            <label style={{ ...labelCss, marginBottom: 8 }}>Orçamento</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ ...labelCss, textTransform: 'none', fontSize: 11.5 }}>Fórmula de quantidade</label>
                <input style={inputCss} value={opt.quantity_formula}
                  onChange={e => onChange({ quantity_formula: e.target.value })}
                  placeholder="Ex: Q2.4.1 ou sqrt(Q1.1)*2" />
              </div>
              <div>
                <label style={{ ...labelCss, textTransform: 'none', fontSize: 11.5 }}>Descrição no orçamento</label>
                <input style={inputCss} value={opt.budget_description}
                  onChange={e => onChange({ budget_description: e.target.value })}
                  placeholder="Ex: Pavimento cerâmico" />
              </div>
              <div>
                <label style={{ ...labelCss, textTransform: 'none', fontSize: 11.5 }}>Categoria do orçamento</label>
                <input style={inputCss} value={opt.budget_category}
                  onChange={e => onChange({ budget_category: e.target.value })}
                  placeholder="Ex: Revestimentos" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Question Detail Panel ──────────────────────────────────────────────────────

function QuestionPanel({
  editQ, deletedOptionIds, isSaving, saveState, onSave, onDelete,
  onQuestionChange, onAddOption, onRemoveOption, onOptionChange, saveError,
}: {
  editQ: AdminQuestion;
  deletedOptionIds: number[];
  isSaving: boolean;
  saveState: 'idle' | 'success' | 'error';
  saveError: string;
  onSave: () => void;
  onDelete: () => void;
  onQuestionChange: (changes: Partial<AdminQuestion>) => void;
  onAddOption: () => void;
  onRemoveOption: (idx: number) => void;
  onOptionChange: (idx: number, changes: Partial<AdminOption>) => void;
}) {
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());
  const showOptions = editQ.type === 'choice' || editQ.type === 'multi_choice' || editQ.type === 'boolean';

  const toggleOption = (idx: number) =>
    setExpandedOptions(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const handleAddOption = () => {
    const newIdx = editQ.options.length;
    onAddOption();
    setExpandedOptions(prev => new Set([...prev, newIdx]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{
        padding: '16px 24px 14px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{editQ.index || '—'}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: C.textTert,
          background: TYPE_COLOR[editQ.type] ?? 'rgba(29,29,31,0.08)',
          padding: '2px 9px', borderRadius: 99,
        }}>
          {TYPE_LABEL[editQ.type]}
        </span>
        {!editQ.id && (
          <span style={{ fontSize: 11, color: C.primary, background: C.primaryBg, padding: '2px 8px', borderRadius: 99 }}>
            Nova
          </span>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* ── Question fields ── */}
        <section style={{ marginBottom: 24 }}>
          <p style={{ ...labelCss, marginBottom: 14, fontSize: 11 }}>Pergunta</p>

          {/* Text */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelCss}>Texto *</label>
            <textarea
              style={{ ...inputCss, minHeight: 56, resize: 'vertical' }}
              value={editQ.text}
              onChange={e => onQuestionChange({ text: e.target.value })}
              placeholder="Texto da pergunta mostrado ao utilizador"
            />
          </div>

          {/* Type + Index + Required */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 80px 120px 1fr', gap: 12, marginBottom: 12, alignItems: 'end' }}>
            <div>
              <label style={labelCss}>Tipo *</label>
              <select
                style={{ ...inputCss }}
                value={editQ.type}
                onChange={e => onQuestionChange({ type: e.target.value as AdminQuestion['type'] })}>
                <option value="choice">Escolha única</option>
                <option value="multi_choice">Escolha múltipla</option>
                <option value="boolean">Sim / Não</option>
                <option value="numeric">Número</option>
                <option value="text">Texto livre</option>
              </select>
            </div>
            <div>
              <label style={labelCss}>Índice *</label>
              <input style={inputCss} value={editQ.index}
                onChange={e => onQuestionChange({ index: e.target.value })}
                placeholder="Ex: 2.4" />
            </div>
            <div>
              <label style={labelCss}>Unidade</label>
              <select
                style={{ ...inputCss }}
                value={editQ.unit}
                onChange={e => onQuestionChange({ unit: e.target.value })}>
                {UNIT_OPTIONS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div style={{ paddingBottom: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: C.text }}>
                <input type="checkbox" checked={editQ.required}
                  onChange={e => onQuestionChange({ required: e.target.checked })} />
                Obrigatória
              </label>
            </div>
          </div>

          {/* Parent + Next (for numeric/text) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelCss}>Índice pai</label>
              <input style={inputCss} value={editQ.parent_index}
                onChange={e => onQuestionChange({ parent_index: e.target.value })}
                placeholder="Ex: 2 (prefixo da divisão)" />
            </div>
            <div>
              <label style={labelCss}>
                {!showOptions ? 'Próxima pergunta (após resposta)' : 'Próxima (numérico/texto)'}
              </label>
              <input style={inputCss} value={editQ.next_question_index}
                onChange={e => onQuestionChange({ next_question_index: e.target.value })}
                placeholder="Ex: 2.5 ou deixar vazio" />
            </div>
          </div>

          {/* Help text */}
          <div>
            <label style={labelCss}>Texto de ajuda (suporta markdown: **negrito**, - lista, linha vazia = parágrafo)</label>
            <textarea
              style={{ ...inputCss, minHeight: 72, resize: 'vertical' }}
              value={editQ.help_text}
              onChange={e => onQuestionChange({ help_text: e.target.value })}
              placeholder={'Ex: Use **negrito** para realçar.\n- Ponto 1\n- Ponto 2'} />
          </div>
        </section>

        {/* ── Options (choice / boolean) ── */}
        {showOptions && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ ...labelCss, margin: 0 }}>
                Opções ({editQ.options.length})
              </p>
              <button onClick={handleAddOption} style={{
                fontSize: 12.5, fontWeight: 600, color: C.primary,
                background: C.primaryBg, border: 'none', borderRadius: 7,
                padding: '5px 12px', cursor: 'pointer',
              }}>
                + Opção
              </button>
            </div>

            {editQ.options.length === 0 ? (
              <div style={{
                padding: '24px', textAlign: 'center',
                border: `1px dashed ${C.border}`, borderRadius: 10,
                color: C.textTert, fontSize: 13,
              }}>
                Sem opções — clique "+ Opção" para adicionar
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {editQ.options.map((opt, idx) => (
                  <OptionRow
                    key={idx}
                    opt={opt}
                    idx={idx}
                    expanded={expandedOptions.has(idx)}
                    onToggle={() => toggleOption(idx)}
                    onChange={changes => onOptionChange(idx, changes)}
                    onRemove={() => onRemoveOption(idx)}
                    siblingOptions={editQ.options}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!showOptions && (
          <div style={{
            padding: '14px', background: 'rgba(29,29,31,0.04)',
            borderRadius: 10, fontSize: 13, color: C.textSec,
          }}>
            Este tipo de pergunta não tem opções. Usa o campo <strong>Próxima pergunta</strong> acima para definir o fluxo.
          </div>
        )}

        <div style={{ height: 100 }} /> {/* bottom padding */}
      </div>

      {/* Save / Delete bar */}
      <div style={{
        flexShrink: 0, padding: '14px 24px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff',
      }}>
        <button onClick={onDelete} disabled={!editQ.id || isSaving} style={{
          fontSize: 13, color: editQ.id ? C.danger : C.textTert,
          background: editQ.id ? C.dangerBg : 'transparent',
          border: 'none', borderRadius: 8, padding: '8px 14px', cursor: editQ.id ? 'pointer' : 'not-allowed',
        }}>
          Eliminar pergunta
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveState === 'success' && (
            <span style={{ fontSize: 13, color: C.success }}>✓ Guardado</span>
          )}
          {saveState === 'error' && (
            <span style={{ fontSize: 13, color: C.danger }} title={saveError}>✗ Erro: {saveError || 'Erro ao guardar'}</span>
          )}
          {deletedOptionIds.length > 0 && saveState === 'idle' && (
            <span style={{ fontSize: 12, color: C.textTert }}>{deletedOptionIds.length} opção(ões) a remover</span>
          )}
          <button onClick={onSave} disabled={isSaving} style={{
            fontSize: 13.5, fontWeight: 600, color: '#fff',
            background: isSaving ? 'rgba(83,74,183,0.5)' : C.primary,
            border: 'none', borderRadius: 8, padding: '9px 22px', cursor: isSaving ? 'not-allowed' : 'pointer',
          }}>
            {isSaving ? 'A guardar…' : 'Guardar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question List Item ─────────────────────────────────────────────────────────

function QuestionListItem({ q, isSelected, onClick }: {
  q: AdminQuestion; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '11px 16px',
      background: isSelected ? C.primaryBg : 'transparent',
      border: 'none', cursor: 'pointer',
      borderLeft: isSelected ? `3px solid ${C.primary}` : '3px solid transparent',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{
        fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
        color: isSelected ? C.primary : C.textTert,
        flexShrink: 0, minWidth: 36,
      }}>
        {q.index}
      </span>
      <span style={{
        flex: 1, fontSize: 13, color: isSelected ? C.text : C.textSec,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {q.text || '(sem texto)'}
      </span>
      <span style={{
        fontSize: 9.5, fontWeight: 600,
        color: C.textTert,
        background: TYPE_COLOR[q.type] ?? 'rgba(29,29,31,0.07)',
        padding: '2px 7px', borderRadius: 99, flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        {q.type === 'boolean' ? 'S/N' : q.type === 'choice' ? '1×' : q.type === 'multi_choice' ? 'N×' : q.type === 'numeric' ? 'NM' : 'TX'}
      </span>
    </button>
  );
}

// ── Main Editor ────────────────────────────────────────────────────────────────

export default function QuestionnaireEditor() {
  const { prefix = '' } = useParams<{ prefix: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  // Current edit state
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [editQ, setEditQ] = useState<AdminQuestion | null>(null);
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const qs = await fetchAdminQuestions(prefix);
      setQuestions(qs);
    } finally {
      setIsLoading(false);
    }
  }, [prefix]);

  useEffect(() => { load(); }, [load]);

  const handleSelectQuestion = (q: AdminQuestion) => {
    setSelectedIndex(q.index);
    setEditQ(deepClone(q));
    setDeletedOptionIds([]);
    setSaveState('idle');
  };

  const handleNewQuestion = () => {
    const q = blank();
    q.parent_index = prefix;
    q.index = `${prefix}.${questions.length + 1}`;
    setSelectedIndex('__new__');
    setEditQ(q);
    setDeletedOptionIds([]);
    setSaveState('idle');
  };

  const handleSave = async () => {
    if (!editQ) return;
    setIsSaving(true);
    setSaveState('idle');
    setSaveError('');
    try {
      const pos = editQ.id
        ? questions.findIndex(q => q.index === editQ.index)
        : questions.length;
      const qToSave: AdminQuestion = {
        ...editQ,
        order_index: pos >= 0 ? pos + 1 : questions.length + 1,
        options: editQ.options.map((opt, i) => ({ ...opt, order_index: i + 1 })),
      };
      await saveQuestion(qToSave, deletedOptionIds);
      const fresh = await fetchAdminQuestions(prefix);
      setQuestions(fresh);
      const saved = fresh.find(q => q.index === editQ.index);
      if (saved) {
        setEditQ(deepClone(saved));
        setSelectedIndex(saved.index);
      }
      setDeletedOptionIds([]);
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editQ?.id || !confirm(`Eliminar a pergunta "${editQ.index}"? As opções e custos associados também serão eliminados.`)) return;
    setIsSaving(true);
    try {
      await deleteQuestion(editQ.id);
      const fresh = await fetchAdminQuestions(prefix);
      setQuestions(fresh);
      setEditQ(null);
      setSelectedIndex(null);
    } catch {
      setSaveState('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOption = () => {
    if (!editQ) return;
    setEditQ({ ...editQ, options: [...editQ.options, blankOption()] });
  };

  const handleRemoveOption = (idx: number) => {
    if (!editQ) return;
    const opt = editQ.options[idx];
    if (opt.id) setDeletedOptionIds(prev => [...prev, opt.id!]);
    setEditQ({ ...editQ, options: editQ.options.filter((_, i) => i !== idx) });
  };

  const handleOptionChange = (idx: number, changes: Partial<AdminOption>) => {
    if (!editQ) return;
    setEditQ({ ...editQ, options: editQ.options.map((o, i) => i === idx ? { ...o, ...changes } : o) });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div style={{
        background: C.header, color: '#fff',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        height: 50, gap: 14, flexShrink: 0,
      }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          fontSize: 13, cursor: 'pointer',
        }}>
          ← Dashboard
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>Prefixo {prefix}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {isLoading ? '…' : `${questions.length} perguntas`}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={handleNewQuestion} style={{
          fontSize: 12.5, fontWeight: 600, color: '#fff',
          background: C.primary, border: 'none', borderRadius: 7,
          padding: '6px 14px', cursor: 'pointer',
        }}>
          + Nova Pergunta
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Question List */}
        <div style={{
          width: 300, flexShrink: 0,
          background: C.bgCard,
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textTert, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Perguntas
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px 16px', color: C.textTert, fontSize: 13 }}>A carregar…</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: '20px 16px', color: C.textTert, fontSize: 13 }}>
                Sem perguntas. Clique "+ Nova Pergunta".
              </div>
            ) : (
              questions.map(q => (
                <QuestionListItem
                  key={q.index}
                  q={q}
                  isSelected={selectedIndex === q.index}
                  onClick={() => handleSelectQuestion(q)}
                />
              ))
            )}
            {selectedIndex === '__new__' && (
              <div style={{
                padding: '11px 16px', borderLeft: `3px solid ${C.primary}`,
                background: C.primaryBg, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: C.primary }}>nova</span>
                <span style={{ fontSize: 13, color: C.text }}>Nova pergunta</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div style={{ flex: 1, overflow: 'hidden', background: C.bg }}>
          {editQ ? (
            <QuestionPanel
              editQ={editQ}
              deletedOptionIds={deletedOptionIds}
              isSaving={isSaving}
              saveState={saveState}
              saveError={saveError}
              onSave={handleSave}
              onDelete={handleDelete}
              onQuestionChange={changes => setEditQ(q => q ? { ...q, ...changes } : q)}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              onOptionChange={handleOptionChange}
            />
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, color: C.textTert,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <span style={{ fontSize: 14 }}>Selecione uma pergunta para editar</span>
              <button onClick={handleNewQuestion} style={{
                fontSize: 13, color: C.primary, background: C.primaryBg,
                border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', marginTop: 4,
              }}>
                + Nova Pergunta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
