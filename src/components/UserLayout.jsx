import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WA_NUMBER = '6283856567928';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20admin%20Nalaysra%20Adventure%2C%20saya%20ingin%20bertanya.`;

export default function UserLayout({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logoutUser(); navigate('/'); };
  const closeNav = () => setNavOpen(false);

  const linkClass = ({ isActive }) =>
    `text-decoration-none small px-2 py-1 rounded ${isActive ? 'bg-white text-dark fw-semibold' : 'text-white-50'}`;

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container">
          <NavLink className="navbar-brand fw-bold" to="/trips" onClick={closeNav}>NalaysraAdventure</NavLink>

          <button className="navbar-toggler d-lg-none border-0" onClick={() => setNavOpen(v => !v)}>
            <span className="navbar-toggler-icon" />
          </button>

          {/* Desktop */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            <NavLink className={linkClass} to="/trips">Trip</NavLink>
            <NavLink className={linkClass} to="/pesanan">Pesanan</NavLink>
            <NavLink className={linkClass} to="/pembayaran">Pembayaran</NavLink>
            <a className="text-decoration-none text-white-50 small px-2 py-1" href={WA_LINK} target="_blank" rel="noreferrer">
              Hubungi Admin
            </a>
            <div className="position-relative ms-2" ref={dropRef}>
              <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => setDropOpen(v => !v)}>
                {user?.nama} ▾
              </button>
              {dropOpen && (
                <div className="position-absolute end-0 mt-1 bg-white rounded shadow" style={{ minWidth: 160, zIndex: 1050 }}>
                  <NavLink className="dropdown-item py-2 small" to="/profil" onClick={() => setDropOpen(false)}>Profil</NavLink>
                  <hr className="dropdown-divider my-1" />
                  <button className="dropdown-item text-danger py-2 small" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile */}
        {navOpen && (
          <div className="w-100 bg-dark border-top border-secondary px-3 pb-3 pt-2">
            {[
              { to: '/trips', label: 'Trip' },
              { to: '/pesanan', label: 'Pesanan Saya' },
              { to: '/pembayaran', label: 'Pembayaran' },
              { to: '/profil', label: `Profil (${user?.nama})` },
            ].map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeNav}
                className={({ isActive }) =>
                  `d-block py-2 text-decoration-none small ${isActive ? 'text-white fw-semibold' : 'text-white-50'}`
                }>
                {item.label}
              </NavLink>
            ))}
            <a className="d-block py-2 text-white-50 text-decoration-none small" href={WA_LINK} target="_blank" rel="noreferrer" onClick={closeNav}>
              Hubungi Admin
            </a>
            <hr className="border-secondary my-2" />
            <button className="btn btn-outline-danger btn-sm w-100" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      <main className="flex-grow-1" style={{ background: '#f5f7fa' }}>
        {children}
      </main>

      <footer className="bg-dark text-white-50 text-center py-3 small">
        © 2025 Nalaysra — Adventure &nbsp;·&nbsp;
        <a href={WA_LINK} target="_blank" rel="noreferrer" className="text-success text-decoration-none">WhatsApp Admin</a>
      </footer>
    </div>
  );
}
