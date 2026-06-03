import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips } from '../api/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const BASE_URL = 'http://localhost:3000';
const WA_NUMBER = '6281234567890';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20admin%20OpenTrip%2C%20saya%20ingin%20bertanya%20tentang%20trip.`;

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    getTrips({ status: 'open' })
      .then((r) => setTrips(r.data.data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  const handlePesan = (id) => {
    if (user) navigate(`/pesan/${id}`);
    else navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-5" to="/">NalaysraAdventure</Link>
          <button className="navbar-toggler d-lg-none border-0" onClick={() => setNavOpen(v => !v)}>
            <span className="navbar-toggler-icon" />
          </button>
          <div className="d-none d-lg-flex align-items-center gap-3">
            <a href="#trips" className="text-white-50 text-decoration-none small">Trip</a>
            <a href="#kontak" className="text-white-50 text-decoration-none small">Kontak</a>
            {user ? (
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/trips'} className="btn btn-outline-light btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">Masuk</Link>
                <Link to="/register" className="btn btn-light btn-sm fw-semibold text-dark">Daftar</Link>
              </>
            )}
          </div>
        </div>
        {navOpen && (
          <div className="w-100 px-3 pb-3 border-top border-secondary">
            <a href="#trips" className="d-block py-2 text-white-50 text-decoration-none small" onClick={() => setNavOpen(false)}>Trip</a>
            <a href="#kontak" className="d-block py-2 text-white-50 text-decoration-none small" onClick={() => setNavOpen(false)}>Kontak</a>
            <div className="d-flex gap-2 mt-2">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/trips'} className="btn btn-outline-light btn-sm w-100">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-light btn-sm flex-grow-1">Masuk</Link>
                  <Link to="/register" className="btn btn-light btn-sm flex-grow-1 fw-semibold text-dark">Daftar</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-dark text-white py-5">
        <div className="container py-4 text-center">
          <p className="text-uppercase text-warning small fw-semibold letter-spacing mb-2">Pendakian Gunung</p>
          <h1 className="display-5 fw-bold mb-3">Jelajahi Puncak Indonesia</h1>
          <p className="text-white-50 mb-4 mx-auto" style={{ maxWidth: 480 }}>
            Temukan open trip pendakian terbaik, booking mudah, dan berangkat bersama komunitas petualang.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="#trips" className="btn btn-warning fw-semibold px-4 text-dark">Lihat Trip</a>
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn btn-outline-light px-4">Hubungi Admin</a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-bottom">
        <div className="container py-3">
          <div className="row g-2 text-center">
            {[
              { val: trips.length, label: 'Trip Tersedia' },
              { val: '100%', label: 'Aman & Terpercaya' },
              { val: '24/7', label: 'Dukungan Admin' },
            ].map((s) => (
              <div className="col-4" key={s.label}>
                <div className="fw-bold fs-5">{s.val}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trip List */}
      <section id="trips" className="py-5 bg-light flex-grow-1">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0">Open Trip Aktif</h5>
              <p className="text-muted small mb-0">Pilih destinasi favoritmu</p>
            </div>
            {!user && (
              <Link to="/register" className="btn btn-dark btn-sm">Daftar Sekarang</Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : trips.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="fs-1">🏔️</p>
              <p>Belum ada trip tersedia saat ini.</p>
            </div>
          ) : (
            <div className="row g-4">
              {trips.map((t) => (
                <div className="col-12 col-sm-6 col-lg-4" key={t.id_trip}>
                  <div className="card border-0 shadow h-100" style={{ borderRadius: 16, overflow: 'hidden' }}>
                    {t.gambar ? (
                      <img src={`${BASE_URL}/uploads/${t.gambar}`} className="card-img-top" alt={t.nama_gunung}
                        style={{ height: 200, objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ height: 200, fontSize: 56 }}>🏔️</div>
                    )}
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{t.nama_trip}</h6>
                        <span className="badge bg-success">Open</span>
                      </div>
                      <p className="text-muted small mb-1">📍 {t.nama_gunung} — {t.lokasi}</p>
                      <p className="text-muted small mb-1">📅 {t.tanggal_berangkat} s/d {t.tanggal_pulang}</p>
                      <p className="text-muted small mb-2">👥 Kuota: {t.kuota} orang</p>
                      <p className="fw-bold text-dark mb-0">{fmt(t.harga)}<span className="fw-normal text-muted small"> / orang</span></p>
                    </div>
                    <div className="card-footer bg-transparent border-0 p-3 pt-0">
                      <button className="btn btn-dark w-100 rounded-pill" onClick={() => handlePesan(t.id_trip)}>
                        {user ? 'Pesan Sekarang' : 'Masuk untuk Pesan'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Kontak */}
      <section id="kontak" className="py-5 bg-dark text-white">
        <div className="container text-center">
          <h5 className="fw-bold mb-2">Ada Pertanyaan?</h5>
          <p className="text-white-50 mb-4">Chat langsung dengan admin kami di WhatsApp.</p>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="btn btn-success btn-lg px-5 rounded-pill">
            Chat WhatsApp Admin
          </a>
        </div>
      </section>

      <footer className="bg-black text-white-50 text-center py-3 small">
        © 2024 Nalaysra Adventure
      </footer>
    </div>
  );
}
