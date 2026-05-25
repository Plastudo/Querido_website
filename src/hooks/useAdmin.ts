import { useAuth } from '../context/AuthContext';

const ADMIN_EMAILS = ((import.meta.env.VITE_ADMIN_EMAIL as string) ?? '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

export function useAdmin(): boolean {
  const { user } = useAuth();
  return !!(user?.email && ADMIN_EMAILS.includes(user.email));
}
