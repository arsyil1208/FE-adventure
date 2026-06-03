import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n ?? 0);

const statusColor = { pending: 'warning', dikonfirmasi: 'success', dibatalkan: 'secondary', selesai: 'primary' };
const tripStatusColor = { open: 'success', full: 'warning', selesai: 'primary', dibatalkan: 'secondary' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
    </AdminLayout>
  );

  const s = data?.statistik ?? {};

  const cards = [
    { label: 'Total User',      value: s.total_user,            icon: '👤', color: 'primary',   to: '/admin/users' },
    { label: 'Pelanggan',       value: s.total_pelanggan,       icon: '🧑', color: 'info',      to: '/admin/pelanggan' },
    { label: 'Total Trip',      value: s.total_trip,            icon: '🗺️', color: 'success',   to: '/admin/trips' },
    { label: 'Trip Open',       value: s.trip_open,             icon: '✅', color: 'success',   to: '/admin/trips' },
    { label: 'Total Pemesanan', value: s.total_pemesanan,       icon: '📋', color: 'warning',   to: '/admin/pemesanan' },
    { label: 'Pending',         value: s.pemesanan_pending,     icon: '⏳', color: 'warning',   to: '/admin/pemesanan' },
    { label: 'Gunung',          value: s.total_gunung,          icon: '🏔️', color: 'secondary', to: '/admin/gunung' },
    { label: 'Pendapatan',      value: fmt(s.total_pendapatan), icon: '💰', color: 'danger',    to: '/admin/pembayaran' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-6 col-md-3" key={c.label}>
            <Link to={c.to} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">{c.label}</span>
                    <span className={`text-${c.color}`} style={{ fontSize: 20 }}>{c.icon}</span>
                  </div>
                  <div className="fw-bold fs-5">{c.value ?? 0}</div>
                </div>
                <div className={`bg-${c.color} rounded-bottom`} style={{ height: 3 }} />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Trip Terbaru */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 px-4">
              <span className="fw-semibold">Trip Terbaru</span>
              <Link to="/admin/trips" className="btn btn-sm btn-outline-secondary rounded-pill">Lihat Semua</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr><th className="px-4">Trip</th><th>Gunung</th><th>Berangkat</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(data?.trip_terbaru ?? []).length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted py-3">Belum ada data</td></tr>
                  )}
                  {(data?.trip_terbaru ?? []).map((t) => (
                    <tr key={t.id_trip}>
                      <td className="small px-4 fw-semibold">{t.nama_trip}</td>
                      <td className="small">{t.nama_gunung}</td>
                      <td className="small">{t.tanggal_berangkat}</td>
                      <td>
                        <span className={`badge rounded-pill bg-${tripStatusColor[t.status] ?? 'secondary'}`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pemesanan Terbaru */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 px-4">
              <span className="fw-semibold">Pemesanan Terbaru</span>
              <Link to="/admin/pemesanan" className="btn btn-sm btn-outline-secondary rounded-pill">Lihat Semua</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr><th className="px-4">Pelanggan</th><th>Trip</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(data?.pemesanan_terbaru ?? []).length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted py-3">Belum ada data</td></tr>
                  )}
                  {(data?.pemesanan_terbaru ?? []).map((p) => (
                    <tr key={p.id_pemesanan}>
                      <td className="small px-4">{p.nama_user}</td>
                      <td className="small">{p.nama_trip}</td>
                      <td className="small">{fmt(p.total_harga)}</td>
                      <td>
                        <span className={`badge rounded-pill bg-${statusColor[p.status] ?? 'secondary'}`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
