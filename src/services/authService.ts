import { supabase } from '../lib/supabase';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function login({ email, password }: LoginPayload): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateError(error.message));
  return sessionToUser(data.user);
}

export async function register({ name, email, password }: RegisterPayload): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(translateError(error.message));
  if (!data.session) throw new Error('Confirma o teu email para activar a conta.');
  return sessionToUser(data.user);
}

export async function forgotPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(translateError(error.message));
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Utilitários internos ─────────────────────────────────────────────────────

function sessionToUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): AuthUser {
  if (!user) throw new Error('Utilizador não encontrado.');
  return {
    id: user.id,
    name: (user.user_metadata?.['name'] as string | undefined) ?? user.email ?? '',
    email: user.email ?? '',
  };
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou password incorrectos.';
  if (msg.includes('User already registered'))   return 'Já existe uma conta com este email.';
  if (msg.includes('Password should be'))        return 'A password deve ter pelo menos 6 caracteres.';
  if (msg.includes('Unable to validate email'))  return 'Email inválido.';
  return msg;
}
