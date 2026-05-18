import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as authService from '../services/authService';
import type { AuthUser } from '../services/authService';
import { getToken, isTokenExpired, removeToken, saveToken } from '../utils/tokenManager';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface AuthContextValue {
  // Estado
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;  // true enquanto verifica o token guardado

  // Modal
  isModalOpen: boolean;
  modalMode: AuthMode;
  openAuthModal: (mode?: AuthMode, pendingAction?: (() => void) | null) => void;
  closeAuthModal: () => void;
  setModalMode: (mode: AuthMode) => void;

  // Acções
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [isInitializing, setInit]     = useState(true);
  const [isModalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]     = useState<AuthMode>('login');

  // Ref evita problemas de closure stale com pendingAction
  const pendingRef = useRef<(() => void) | null>(null);

  // ── Verificação do token guardado ─────────────────────────────────────────

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      removeToken();
      setInit(false);
      return;
    }
    authService.verifyToken(token)
      .then(u => setUser(u))
      .catch(() => { removeToken(); })
      .finally(() => setInit(false));
  }, []);

  // ── Controlo do modal ─────────────────────────────────────────────────────

  const openAuthModal = useCallback(
    (mode: AuthMode = 'login', pendingAction: (() => void) | null = null) => {
      setModalMode(mode);
      pendingRef.current = pendingAction;
      setModalOpen(true);
    },
    [],
  );

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
    pendingRef.current = null;
  }, []);

  // ── Acções de autenticação ────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await authService.login({ email, password });
    saveToken(token);
    setUser(u);
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    pending?.();
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: u } = await authService.register({ name, email, password });
    saveToken(token);
    setUser(u);
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    pending?.();
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email);
  }, []);

  // ── Fechar com ESC ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isModalOpen, closeAuthModal]);

  // ── Bloquear scroll do body quando modal está aberto ─────────────────────

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isInitializing,
      isModalOpen,
      modalMode,
      openAuthModal,
      closeAuthModal,
      setModalMode,
      login,
      register,
      logout,
      forgotPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
