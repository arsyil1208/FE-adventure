import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      loginUser(token, user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/trips', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: '#f5f7fa' }}>
      {/* Panel kiri — dekorasi */}
      <div className="d-none d-lg-flex flex-column justify-content-center align-items-center bg-dark text-white col-lg-5 p-5">
        <div className="text-center">
          <div style={{ fontSize: 64 }}></div>
          <h2 className="fw-bold mt-3">NalaysraAdventure</h2>
          <p className="text-white-50 mt-2">Platform open trip pendakian gunung terpercaya.</p>
          <div className="mt-4 d-flex flex-column gap-2 text-start">
            {['Pesan trip dengan mudah', 'Pembayaran aman & transparan', 'Didampingi guide berpengalaman'].map((t) => (
              <div key={t} className="d-flex align-items-center gap-2 text-white-50 small">
                <span className="text-success fw-bold">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel kanan — form */}
      <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 p-4">
        <div className="w-100" style={{ maxWidth: 400 }}>
          <div className="d-lg-none text-center mb-4">
            <div style={{ fontSize: 40 }}></div>
            <h5 className="fw-bold">NalaysraAdventure</h5>
          </div>
          <h5 className="fw-bold mb-1">Selamat Datang</h5>
          <p className="text-muted small mb-4">Masuk untuk melanjutkan</p>

          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" className="form-control" placeholder="email@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Masuk
            </button>
          </form>

          <p className="text-center mt-4 small text-muted">
            Belum punya akun?{' '}
            <Link to="/register" className="fw-semibold text-dark">Daftar gratis</Link>
          </p>
          <p className="text-center small text-muted">
            <Link to="/" className="text-muted text-decoration-none">← Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
