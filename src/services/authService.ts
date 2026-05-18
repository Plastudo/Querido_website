/**
 * authService.ts
 *
 * Camada de serviço para autenticação. Por defeito opera em modo mock
 * (sem backend). Para activar o backend real, define VITE_API_URL no .env
 * e remove ou define VITE_USE_MOCK_AUTH=false.
 *
 * Endpoints esperados no backend:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   GET  /api/auth/verify-token  (Authorization: Bearer <token>)
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const USE_MOCK = !API_BASE || import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

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

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Utilitários internos ─────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Armazena utilizadores em memória para o mock (reseta ao recarregar)
const mockStore = new Map<string, AuthUser & { password: string }>();

function buildMockToken(user: AuthUser): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ ...user, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86_400 }));
  return `${header}.${payload}.mock_sig`;
}

async function apiFetch<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Erro inesperado.');
  return data as T;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(650);
    const found = [...mockStore.values()].find(u => u.email === payload.email);
    if (!found || found.password !== payload.password) {
      throw new Error('Email ou password incorrectos.');
    }
    const { password: _pw, ...user } = found;
    return { token: buildMockToken(user), user };
  }
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(800);
    const exists = [...mockStore.values()].some(u => u.email === payload.email);
    if (exists) throw new Error('Já existe uma conta com este email.');
    const user: AuthUser = { id: `u_${Date.now()}`, name: payload.name, email: payload.email };
    mockStore.set(user.id, { ...user, password: payload.password });
    return { token: buildMockToken(user), user };
  }
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string): Promise<void> {
  if (USE_MOCK) {
    await delay(600);
    return; // não revela se o email existe
  }
  await apiFetch<void>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (USE_MOCK) {
    await delay(600);
    return;
  }
  await apiFetch<void>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function verifyToken(token: string): Promise<AuthUser> {
  if (USE_MOCK) {
    await delay(80);
    try {
      const raw = token.split('.')[1];
      const payload = JSON.parse(atob(raw)) as { id: string; name: string; email: string; exp: number };
      if (payload.exp * 1000 < Date.now()) throw new Error('Token expirado.');
      return { id: payload.id, name: payload.name, email: payload.email };
    } catch {
      throw new Error('Token inválido.');
    }
  }
  const res = await fetch(`${API_BASE}/api/auth/verify-token`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Token inválido.');
  return (data as { user: AuthUser }).user;
}
