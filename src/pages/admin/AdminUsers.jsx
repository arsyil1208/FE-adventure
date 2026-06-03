import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';
import useBootstrapModal from '../../hooks/useBootstrapModal';

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ nama: '', email: '', role: 'pelanggan' });
  const [saving, setSaving] = useState(false);
  const { modalRef, showModal, hideModal } = useBootstrapModal();

  const load = async () => {
    setLoading(true);
    try { const res = await getUsers(); setList(res.data.data); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setEditTarget(u);
    setForm({ nama: u.nama, email: u.email, role: u.role });
    setError('');
    showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await updateUser(editTarget.id_user, form);
      setSuccess('User diperbarui.');
      hideModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
    finally { setSaving(false); }
  };

  const hapus = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try { await deleteUser(id); setSuccess('User dihapus.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  return (
    <AdminLayout title="Manajemen User">
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle bg-white shadow-sm">
            <thead className="table-dark">
              <tr><th>#</th><th>Nama</th><th>Email</th><th>Role</th><th>Terdaftar</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Tidak ada user.</td></tr>}
              {list.map((u) => (
                <tr key={u.id_user}>
                  <td className="small">{u.id_user}</td>
                  <td className="small fw-semibold">{u.nama}</td>
                  <td className="small">{u.email}</td>
                  <td><span className={`badge bg-${u.role === 'admin' ? 'warning text-dark' : 'secondary'}`}>{u.role}</span></td>
                  <td className="small">{u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-xs btn-outline-primary" style={{ fontSize: '0.72rem', padding: '2px 7px' }} onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-xs btn-outline-danger" style={{ fontSize: '0.72rem', padding: '2px 7px' }} onClick={() => hapus(u.id_user)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">Edit User</h6>
              <button type="button" className="btn-close" onClick={hideModal} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <Alert message={error} onClose={() => setError('')} />
                <div className="mb-2"><label className="form-label">Nama</label>
                  <input name="nama" className="form-control form-control-sm" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /></div>
                <div className="mb-2"><label className="form-label">Email</label>
                  <input type="email" name="email" className="form-control form-control-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="mb-2"><label className="form-label">Role</label>
                  <select className="form-select form-select-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="pelanggan">Pelanggan</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" onClick={hideModal}>Batal</button>
                <button type="submit" className="btn btn-sm btn-dark" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-1" />}Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
