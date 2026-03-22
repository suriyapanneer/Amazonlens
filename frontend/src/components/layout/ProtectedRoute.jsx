import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While Supabase is checking the session, show a spinner.
  // This prevents the catch-all route from firing and redirecting to /
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-[3px] rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: 'rgba(240,160,48,0.2)',
              borderTopColor: 'var(--amber)',
            }}
          />
          <p style={{ color: 'var(--sub)', fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — send to login but remember where they were
  // so after login they can be sent back to the right page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in — render the page they asked for
  return <Outlet />;
}