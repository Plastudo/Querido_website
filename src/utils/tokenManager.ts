const TOKEN_KEY = 'querido_auth_token';

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function parseJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenPayload(token: string): { id: string; name: string; email: string } | null {
  const payload = parseJWT(token);
  if (
    payload &&
    typeof payload.id === 'string' &&
    typeof payload.name === 'string' &&
    typeof payload.email === 'string'
  ) {
    return { id: payload.id, name: payload.name, email: payload.email };
  }
  return null;
}
