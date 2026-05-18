import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSwitchToForgot }: Props) {
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Validação cliente ─────────────────────────────────────────────────────

  function validate(): string | null {
    if (!email.trim()) return 'Introduza o seu email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de email inválido.';
    if (!password) return 'Introduza a sua password.';
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
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login">

      {error && (
        <div className="form-error" role="alert">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="login-email" className="form-label">Email</label>
        <input
          id="login-email"
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
        <label htmlFor="login-password" className="form-label">Password</label>
        <input
          id="login-password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="button"
          className="auth-link-btn"
          onClick={onSwitchToForgot}
          style={{ alignSelf: 'flex-end', marginTop: 4 }}
        >
          Esqueci a password
        </button>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn--full"
        style={{ marginTop: 8 }}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
        {loading ? 'A entrar…' : 'Entrar'}
      </button>

      <p className="auth-modal__switch">
        Não tem conta?{' '}
        <button type="button" onClick={onSwitchToRegister}>
          Criar conta
        </button>
      </p>
    </form>
  );
}
