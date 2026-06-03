import { useEffect, useState } from 'react';
import { getPembayaran } from '../../api/api';
import UserLayout from '../../components/UserLayout';
import Alert from '../../components/Alert';
import { BASE_URL } from '../../api/api';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  menunggu: { color: 'warning',   label: 'Menunggu Verifikasi' },
  lunas:    { color: 'success',   label: 'Lunas' },
  gagal:    { color: 'danger',    label: 'Ditolak' },
  refund:   { color: 'info',      label: 'Refund' },
};

export default function UserPembayaran() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPembayaran()
      .then((r) => setList(r.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <div className="container py-4">
        <h5 className="fw-bold mb-4">Riwayat Pembayaran</h5>
        <Alert message={error} onClose={() => setError('')} />

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-1 text-muted">💳</p>
            <p className="text-muted">Belum ada riwayat pembayaran.</p>
          </div>
        ) : (
          <div className="row g-3">
            {list.map((p) => {
              const s = statusConfig[p.status] ?? { color: 'secondary', label: p.status };
              return (
                <div className="col-12 col-lg-6" key={p.id_pembayaran}>
                  <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{p.nama_trip}</h6>
                          <p className="text-muted small mb-0">{p.metode?.replace('_', ' ')}</p>
                        </div>
                        <span className={`badge bg-${s.color} rounded-pill`}>{s.label}</span>
                      </div>
                      <div className="row g-2 small text-muted mb-3">
                        <div className="col-6 fw-semibold text-dark fs-6">{fmt(p.total_harga)}</div>
                        <div className="col-6 text-end">
                          {p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                      {p.bukti_bayar && (
                        <a href={`${BASE_URL}/uploads/${p.bukti_bayar}`} target="_blank" rel="noreferrer"
                          className="btn btn-outline-secondary btn-sm rounded-pill">
                          Lihat Bukti
                        </a>
                      )}
                      {p.status === 'gagal' && (
                        <div className="alert alert-danger py-2 px-3 small mt-2 mb-0">
                          Pembayaran ditolak. Silakan hubungi admin.
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
