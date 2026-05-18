import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchToLogin }: Props) {
  const { forgotPassword } = useAuth();

  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Introduza o seu email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Formato de email inválido.'); return; }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar o email.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div aria-live="polite">
        <div className="form-success">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Email enviado!</strong> Verifique a sua caixa de entrada (e pasta de spam)
            para o link de recuperação.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn--full"
          onClick={onSwitchToLogin}
        >
          Voltar ao login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de recuperação de password">
      <p style={{ fontSize: 'var(--text-body-sm-size)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
        Introduza o email da sua conta e enviamos um link para redefinir a password.
      </p>

      {error && (
        <div className="form-error" role="alert">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="forgot-email" className="form-label">Email</label>
        <input
          id="forgot-email"
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

      <button
        type="submit"
        className="btn btn-primary btn--full"
        style={{ marginTop: 8 }}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
        {loading ? 'A enviar…' : 'Enviar link de recuperação'}
      </button>

      <p className="auth-modal__switch">
        <button type="button" onClick={onSwitchToLogin}>
          ← Voltar ao login
        </button>
      </p>
    </form>
  );
}
