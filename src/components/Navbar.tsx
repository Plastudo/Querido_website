import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { getSavedBudgets } from '../utils/storage';

export default function Navbar() {
  const { i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt');

  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const isAdmin = useAdmin();

  const [count, setCount] = useState(() => getSavedBudgets().length);

  useEffect(() => {
    const refresh = () => setCount(getSavedBudgets().length);
    window.addEventListener('querido:budgets-updated', refresh);
    window.addEventListener('storage', refresh); // sincroniza entre tabs
    return () => {
      window.removeEventListener('querido:budgets-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // Iniciais do nome para o avatar
  const initials = user
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">Querido</Link>

      <div className="navbar__actions">
        {isAdmin && (
          <Link
            to="/admin"
            className="btn btn-ghost btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, opacity: 0.7 }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Admin
          </Link>
        )}

        {isAuthenticated ? (
          <Link
            to="/area-cliente"
            className="btn btn-ghost btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Os meus orçamentos
            {count > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, borderRadius: 9,
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 10, fontWeight: 700,
                padding: '0 4px',
              }}>
                {count}
              </span>
            )}
          </Link>
        ) : null}

        {isAuthenticated ? (
          <>
            <div className="navbar__user">
              <div className="navbar__avatar" aria-hidden="true">{initials}</div>
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user!.name.split(' ')[0]}
              </span>
            </div>
            <button
              className="btn btn-ghost btn--sm"
              onClick={logout}
              aria-label="Terminar sessão"
            >
              Sair
            </button>
          </>
        ) : (
          <button
            className="btn btn-secondary btn--sm"
            onClick={() => openAuthModal('login')}
          >
            Entrar
          </button>
        )}

        <button className="btn btn-ghost btn--sm" onClick={toggleLang}>
          {i18n.language === 'pt' ? 'EN' : 'PT'}
        </button>
      </div>
    </nav>
  );
}
