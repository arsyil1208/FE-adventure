import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPemesanan, updateStatusPemesanan } from '../../api/api';
import UserLayout from '../../components/UserLayout';
import Alert from '../../components/Alert';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  pending:      { color: 'warning',   label: 'Menunggu' },
  dikonfirmasi: { color: 'success',   label: 'Dikonfirmasi' },
  dibatalkan:   { color: 'secondary', label: 'Dibatalkan' },
  selesai:      { color: 'primary',   label: 'Selesai' },
};

export default function UserPesanan() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    getPemesanan()
      .then((r) => setList(r.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Gagal.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const batalkan = async (id) => {
    if (!confirm('Batalkan pesanan ini?')) return;
    try { await updateStatusPemesanan(id, 'dibatalkan'); setSuccess('Pesanan dibatalkan.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <h5 className="fw-bold mb-4">Pesanan Saya</h5>

        <Alert type="success" message={success} onClose={() => setSuccess('')} />
        <Alert message={error} onClose={() => setError('')} />

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-1 text-muted">📋</p>
            <p className="text-muted">Belum ada pesanan.</p>
            <button className="btn btn-dark rounded-pill px-4" onClick={() => navigate('/trips')}>
              Jelajahi Trip
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {list.map((p) => {
              const s = statusConfig[p.status] ?? { color: 'secondary', label: p.status };
              return (
                <div className="col-12 col-lg-6" key={p.id_pemesanan}>
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{p.nama_trip}</h6>
                          <p className="text-muted small mb-0">📍 {p.nama_gunung}</p>
                        </div>
                        <span className={`badge bg-${s.color} rounded-pill`}>{s.label}</span>
                      </div>
                      <div className="row g-2 small text-muted mb-3">
                        <div className="col-6">📅 {p.tanggal_berangkat}</div>
                        <div className="col-6">👥 {p.jumlah_peserta} peserta</div>
                        <div className="col-6">🗓️ {p.tanggal_pesan ? new Date(p.tanggal_pesan).toLocaleDateString('id-ID') : '-'}</div>
                        <div className="col-6 fw-semibold text-dark">{fmt(p.total_harga)}</div>
                      </div>
                      {p.status === 'pending' && (
                        <div className="d-flex gap-2">
                          <button className="btn btn-dark btn-sm rounded-pill flex-grow-1"
                            onClick={() => navigate(`/bayar/${p.id_pemesanan}`)}>
                            Bayar Sekarang
                          </button>
                          <button className="btn btn-outline-danger btn-sm rounded-pill"
                            onClick={() => batalkan(p.id_pemesanan)}>
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
