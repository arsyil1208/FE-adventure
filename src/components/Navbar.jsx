import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid px-3">
        <Link className="navbar-brand fw-bold" to={isAdmin ? '/admin/dashboard' : '/trips'}>
          NalaysraAdventure
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/gunung">Gunung</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/trips">Nalaysra Adventure</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/pemesanan">Pemesanan</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/pembayaran">Pembayaran</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">Users</Link>
                </li>
              </>
            )}
            {!isAdmin && user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/trips">Nalaysra Adventure</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pemesanan">Pesanan Saya</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pembayaran">Pembayaran</Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item d-flex align-items-center">
                  <Link className="nav-link btn btn-outline-light btn-sm me-2" to="/profil" style={{ padding: '6px 10px' }}>
                    👤 {user.nama}{isAdmin ? ' • Admin' : ''}
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <Link className="nav-link btn btn-outline-light btn-sm me-2" to={isAdmin ? '/admin/dashboard' : '/trips'} style={{ padding: '6px 10px' }}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
