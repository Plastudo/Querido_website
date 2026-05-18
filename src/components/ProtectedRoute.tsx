import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

/**
 * Envolve rotas que exigem autenticação.
 * Se o utilizador não estiver autenticado: redireciona para a página inicial
 * e abre o AuthModal com a navegação pendente para retomar após login.
 */
export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isInitializing, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      openAuthModal('login');
    }
  }, [isAuthenticated, isInitializing, navigate, openAuthModal]);

  if (isInitializing || !isAuthenticated) return null;

  return <>{children}</>;
}
