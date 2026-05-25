import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/authService';
import type { AuthUser } from '../services/authService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  isModalOpen: boolean;
  modalMode: AuthMode;
  openAuthModal: (mode?: AuthMode, pendingAction?: (() => void) | null) => void;
  closeAuthModal: () => void;
  setModalMode: (mode: AuthMode) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]             = useState<AuthUser | null>(null);
  const [isInitializing, setInit]   = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode]   = useState<AuthMode>('login');

  const pendingRef = useRef<(() => void) | null>(null);

  // ── Sessão Supabase ───────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? toAuthUser(session.user) : null);
      setInit(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toAuthUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
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
    const u = await authService.login({ email, password });
    setUser(u);
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    pending?.();
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const u = await authService.register({ name, email, password });
    setUser(u);
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    pending?.();
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
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

// ─── Utilitário interno ───────────────────────────────────────────────────────

function toAuthUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser {
  return {
    id: user.id,
    name: (user.user_metadata?.['name'] as string | undefined) ?? user.email ?? '',
    email: user.email ?? '',
  };
}
