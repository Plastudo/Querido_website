import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isInitializing } = useAuth();
  const isAdmin = useAdmin();

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'rgb(248,247,245)' }}>
        <span style={{ fontSize: 14, color: 'rgba(29,29,31,0.45)' }}>A verificar credenciais…</span>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
