import { useEffect, useState } from 'react';
import { getAllPelanggan, deletePelanggan } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';

export default function AdminPelanggan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await getAllPelanggan(); setList(res.data.data); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const hapus = async (id) => {
    if (!confirm('Hapus data pelanggan ini?')) return;
    try { await deletePelanggan(id); setSuccess('Data dihapus.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  const filtered = list.filter((p) =>
    p.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.nik?.includes(search)
  );

  return (
    <AdminLayout title="Data Pelanggan">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
          <input className="form-control" placeholder="Cari nama / NIK / email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-muted small">{filtered.length} data</span>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle bg-white shadow-sm">
            <thead className="table-dark">
              <tr><th>#</th><th>NIK</th><th>Nama Lengkap</th><th>Jenis Kelamin</th><th>Tgl Lahir</th><th>No. HP</th><th>Email Akun</th><th>Kontak Darurat</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Tidak ada data.</td></tr>}
              {filtered.map((p) => (
                <tr key={p.id_pelanggan}>
                  <td className="small">{p.id_pelanggan}</td>
                  <td className="small font-monospace">{p.nik}</td>
                  <td className="small fw-semibold">{p.nama_lengkap}</td>
                  <td className="small text-center">{p.jenis_kelamin === 'L' ? '♂ L' : '♀ P'}</td>
                  <td className="small">{p.tanggal_lahir}</td>
                  <td className="small">{p.no_hp}</td>
                  <td className="small">{p.email}</td>
                  <td className="small">{p.kontak_darurat || '-'}</td>
                  <td>
                    <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                      onClick={() => hapus(p.id_pelanggan)}>🗑️ Hapus</button>
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
