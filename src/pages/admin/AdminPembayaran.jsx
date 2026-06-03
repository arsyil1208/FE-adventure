import { useEffect, useState } from 'react';
import { getPembayaran, updateStatusPembayaran, deletePembayaran } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';
import { BASE_URL } from '../../api/api';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const statusColor = { menunggu: 'warning', lunas: 'success', gagal: 'danger', refund: 'info' };

export default function AdminPembayaran() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {}; if (filterStatus) params.status = filterStatus;
      const res = await getPembayaran(params);
      setList(res.data.data);
    } catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const changeStatus = async (id, status) => {
    if (!confirm(`Ubah status ke "${status}"?`)) return;
    try { await updateStatusPembayaran(id, status); setSuccess(`Status → ${status}`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  const hapus = async (id) => {
    if (!confirm('Hapus data pembayaran?')) return;
    try { await deletePembayaran(id); setSuccess('Dihapus.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  return (
    <AdminLayout title="Manajemen Pembayaran">
      <div className="d-flex flex-wrap gap-2 mb-3">
        {['', 'menunggu', 'lunas', 'gagal', 'refund'].map((s) => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(s)}>
            {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle bg-white shadow-sm">
            <thead className="table-dark">
              <tr><th>#</th><th>Pelanggan</th><th>Trip</th><th>Total</th><th>Metode</th><th>Bukti</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Tidak ada data.</td></tr>}
              {list.map((p) => (
                <tr key={p.id_pembayaran}>
                  <td className="small">{p.id_pembayaran}</td>
                  <td className="small">{p.nama_user}</td>
                  <td className="small">{p.nama_trip}</td>
                  <td className="small">{fmt(p.total_harga)}</td>
                  <td className="small">{p.metode?.replace('_', ' ')}</td>
                  <td>
                    {p.bukti_bayar
                      ? <a href={`${BASE_URL}/uploads/${p.bukti_bayar}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-secondary" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Lihat</a>
                      : <span className="text-muted small">-</span>}
                  </td>
                  <td className="small">{p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString('id-ID') : '-'}</td>
                  <td><span className={`badge bg-${statusColor[p.status] ?? 'secondary'}`}>{p.status}</span></td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {p.status === 'menunggu' && <>
                        <button className="btn btn-xs btn-success" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => changeStatus(p.id_pembayaran, 'lunas')}>✓ Lunas</button>
                        <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => changeStatus(p.id_pembayaran, 'gagal')}>✕ Tolak</button>
                      </>}
                      {p.status === 'lunas' && (
                        <button className="btn btn-xs btn-outline-info" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => changeStatus(p.id_pembayaran, 'refund')}>Refund</button>
                      )}
                      <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }} onClick={() => hapus(p.id_pembayaran)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
