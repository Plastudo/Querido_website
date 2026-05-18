import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordForm from './ForgotPasswordForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  'login': {
    title: 'Bem-vindo de volta',
    subtitle: 'Inicie sessão para aceder aos seus orçamentos.',
  },
  'register': {
    title: 'Criar conta',
    subtitle: 'Guarde e gerencie os seus orçamentos de obra.',
  },
  'forgot-password': {
    title: 'Recuperar password',
    subtitle: 'Enviamos um link para o seu email.',
  },
};

export default function AuthModal() {
  const { isModalOpen, closeAuthModal, modalMode, setModalMode } = useAuth();
  const overlayRef  = useRef<HTMLDivElement>(null);
  const titleId     = 'auth-modal-title';

  // Foco no modal ao abrir
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isModalOpen) {
      // Pequeno delay para a animação CSS não ser cortada
      requestAnimationFrame(() => modalRef.current?.focus());
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const { title, subtitle } = TITLES[modalMode];

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) closeAuthModal();
  }

  return (
    <div
      ref={overlayRef}
      className="auth-overlay"
      role="presentation"
      onClick={handleOverlayClick}
      aria-hidden={!isModalOpen}
    >
      <div
        ref={modalRef}
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* Botão de fechar */}
        <button
          className="auth-modal__close"
          onClick={closeAuthModal}
          aria-label="Fechar"
          type="button"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Cabeçalho */}
        <div className="auth-modal__header">
          <h2 id={titleId} className="auth-modal__title">{title}</h2>
          <p className="auth-modal__subtitle">{subtitle}</p>
        </div>

        {/* Formulário activo */}
        {modalMode === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setModalMode('register')}
            onSwitchToForgot={() => setModalMode('forgot-password')}
          />
        )}
        {modalMode === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setModalMode('login')}
          />
        )}
        {modalMode === 'forgot-password' && (
          <ForgotPasswordForm
            onSwitchToLogin={() => setModalMode('login')}
          />
        )}
      </div>
    </div>
  );
}
