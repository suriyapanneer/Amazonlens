import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--amber)30', borderTopColor: 'var(--amber)' }} />
          <p style={{ color: 'var(--sub)', fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
