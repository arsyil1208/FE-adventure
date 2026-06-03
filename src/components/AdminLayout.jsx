import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/admin/trips',      label: 'Open Trip',   icon: '🗺️' },
  { to: '/admin/pemesanan',  label: 'Pemesanan',   icon: '📋' },
  { to: '/admin/pembayaran', label: 'Pembayaran',  icon: '💰' },
  { to: '/admin/pelanggan',  label: 'Pelanggan',   icon: '🧑' },
  { to: '/admin/users',      label: 'Users',       icon: '👤' },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 992);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isDesktop;
}

export default function AdminLayout({ children, title }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const closeNav = () => setSidebarOpen(false);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f5f7fa' }}>

      {/* Top bar */}
      <nav className="bg-dark text-white px-3 py-2 d-flex align-items-center shadow-sm"
        style={{ position: 'sticky', top: 0, zIndex: 1030, minHeight: 52 }}>
        {!isDesktop && (
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setSidebarOpen(v => !v)}>☰</button>
        )}
        <span className="fw-bold me-2">NalaysraAdventure</span>
        {title && <span className="text-white-50 small d-none d-md-inline">/ {title}</span>}
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="text-white-50 small d-none d-sm-inline">{user?.nama}</span>
          <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 position-relative overflow-hidden">
        {/* Overlay mobile */}
        {!isDesktop && sidebarOpen && (
          <div onClick={closeNav} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1040
          }} />
        )}

        {/* Sidebar */}
        <div className="bg-dark text-white d-flex flex-column"
          style={{
            width: 220, minWidth: 220, flexShrink: 0,
            ...(isDesktop
              ? { position: 'sticky', top: 52, height: 'calc(100vh - 52px)', overflowY: 'auto' }
              : {
                position: 'fixed', top: 0, bottom: 0,
                left: sidebarOpen ? 0 : -225,
                transition: 'left 0.25s ease',
                zIndex: 1050, overflowY: 'auto',
              }
            ),
          }}>
          <div className="px-3 pt-4 pb-2">
            <div className="small text-warning fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>Admin Panel</div>
          </div>
          <nav className="flex-grow-1 px-2 py-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeNav}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none small mb-1 ${
                    isActive ? 'bg-primary text-white' : 'text-white-50'
                  }`
                }>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-3 border-top border-secondary">
            <div className="small text-white-50 text-truncate mb-2">{user?.nama}</div>
            <button className="btn btn-outline-light btn-sm w-100 rounded-pill" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Konten */}
        <div className="flex-grow-1" style={{ minWidth: 0, overflowX: 'auto' }}>
          {title && (
            <div className="bg-white border-bottom px-4 py-3">
              <h6 className="mb-0 fw-bold">{title}</h6>
            </div>
          )}
          <main className="p-3 p-md-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
