import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AuthMode } from '../context/AuthContext';

/**
 * Hook que interceta acções que requerem autenticação.
 *
 * Uso:
 *   const { withAuth } = useProtectedAction();
 *   <button onClick={() => withAuth(() => saveOrcamento())}>Guardar</button>
 *
 * Quando o utilizador não está autenticado:
 *   1. Abre o AuthModal em modo login
 *   2. Após login/registo bem-sucedido, executa a acção original automaticamente
 */
export function useProtectedAction() {
  const { isAuthenticated, openAuthModal } = useAuth();

  const withAuth = useCallback(
    (action: () => void, mode: AuthMode = 'login') => {
      if (isAuthenticated) {
        action();
      } else {
        openAuthModal(mode, action);
      }
    },
    [isAuthenticated, openAuthModal],
  );

  return { withAuth };
}
