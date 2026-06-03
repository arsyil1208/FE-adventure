import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/api';
import Alert from '../components/Alert';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await register(form);
      setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: '#f5f7fa' }}>
      {/* Panel kiri */}
      <div className="d-none d-lg-flex flex-column justify-content-center align-items-center bg-dark text-white col-lg-5 p-5">
        <div className="text-center">
          <div style={{ fontSize: 64 }}>🏔️</div>
          <h2 className="fw-bold mt-3">Bergabung Sekarang</h2>
          <p className="text-white-50 mt-2">Daftar gratis dan mulai jelajahi trip pendakian favoritmu.</p>
        </div>
      </div>

      {/* Panel kanan */}
      <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 p-4">
        <div className="w-100" style={{ maxWidth: 400 }}>
          <div className="d-lg-none text-center mb-4">
            <div style={{ fontSize: 40 }}></div>
            <h5 className="fw-bold">NalaysraAdventure</h5>
          </div>
          <h5 className="fw-bold mb-1">Buat Akun Baru</h5>
          <p className="text-muted small mb-4">Gratis, cepat, dan mudah</p>

          <Alert message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nama Lengkap</label>
              <input type="text" className="form-control" placeholder="Nama kamu"
                value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" className="form-control" placeholder="email@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input type="password" className="form-control" placeholder="Min. 6 karakter"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Daftar Sekarang
            </button>
          </form>

          <p className="text-center mt-4 small text-muted">
            Sudah punya akun?{' '}
            <Link to="/login" className="fw-semibold text-dark">Masuk</Link>
          </p>
          <p className="text-center small text-muted">
            <Link to="/" className="text-muted text-decoration-none">← Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
