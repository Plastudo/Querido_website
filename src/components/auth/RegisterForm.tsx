import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const { register } = useAuth();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [terms, setTerms]         = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // ── Força da password ─────────────────────────────────────────────────────

  function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
    return score as 0 | 1 | 2 | 3;
  }

  const strength = passwordStrength(password);
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Forte'];
  const strengthColors = ['', 'rgb(215, 70, 60)', 'rgb(155, 122, 31)', 'rgb(63, 111, 98)'];

  // ── Validação cliente ─────────────────────────────────────────────────────

  function validate(): string | null {
    if (!name.trim()) return 'Introduza o seu nome completo.';
    if (!email.trim()) return 'Introduza o seu email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de email inválido.';
    if (password.length < 8) return 'A password deve ter pelo menos 8 caracteres.';
    if (password !== confirm) return 'As passwords não coincidem.';
    if (!terms) return 'Deve aceitar os Termos e Condições.';
    return null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const msg = validate();
    if (msg) { setError(msg); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de registo">

      {error && (
        <div className="form-error" role="alert">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="reg-name" className="form-label">Nome completo</label>
        <input
          id="reg-name"
          type="text"
          className="form-input"
          placeholder="Maria Silva"
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="reg-email" className="form-label">Email</label>
        <input
          id="reg-email"
          type="email"
          className="form-input"
          placeholder="o.seu@email.com"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="reg-password" className="form-label">Password</label>
        <input
          id="reg-password"
          type="password"
          className="form-input"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        {password.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: strength >= i ? strengthColors[strength] : 'var(--color-border-subtle)',
                    transition: 'background var(--transition-base)',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12, color: strengthColors[strength] }}>
              {strengthLabels[strength]}
            </span>
          </div>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="reg-confirm" className="form-label">Confirmar password</label>
        <input
          id="reg-confirm"
          type="password"
          className="form-input"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          disabled={loading}
          required
        />
        {confirm.length > 0 && password !== confirm && (
          <span className="form-field-error">As passwords não coincidem.</span>
        )}
      </div>

      <label className="form-checkbox" style={{ marginBottom: 'var(--space-6)' }}>
        <input
          type="checkbox"
          checked={terms}
          onChange={e => setTerms(e.target.checked)}
          disabled={loading}
          aria-required="true"
        />
        <span>
          Li e aceito os{' '}
          <a href="/termos" target="_blank" rel="noopener noreferrer" className="auth-link-btn" style={{ textDecoration: 'underline' }}>
            Termos e Condições
          </a>{' '}
          e a{' '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="auth-link-btn" style={{ textDecoration: 'underline' }}>
            Política de Privacidade
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        className="btn btn-primary btn--full"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
        {loading ? 'A criar conta…' : 'Criar conta'}
      </button>

      <p className="auth-modal__switch">
        Já tem conta?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Iniciar sessão
        </button>
      </p>
    </form>
  );
}
