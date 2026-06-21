import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Belum login → halaman login
  if (!user) return <Navigate to="/login" replace />;

  // Halaman admin, user bukan admin → home
  if (adminOnly && user.role !== 'admin') return <Navigate to="/trips" replace />;

  // Halaman user (bukan admin), yang akses adalah admin → dashboard admin
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return children;
}
