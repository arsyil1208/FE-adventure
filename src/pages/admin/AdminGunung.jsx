import { useEffect, useState, useRef } from 'react';
import { getGunung, createGunung, updateGunung, deleteGunung } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';
import useBootstrapModal from '../../hooks/useBootstrapModal';
import { BASE_URL } from '../../api/api';

const EMPTY = { nama_gunung: '', lokasi: '', ketinggian: '', deskripsi: '', gambar: null };

export default function AdminGunung() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();
  const { modalRef, showModal, hideModal } = useBootstrapModal();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGunung(search ? { search } : {});
      setList(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (g = null) => {
    setError('');
    if (g) {
      setEditId(g.id_gunung);
      setForm({ nama_gunung: g.nama_gunung, lokasi: g.lokasi, ketinggian: g.ketinggian, deskripsi: g.deskripsi || '', gambar: null });
      setPreview(g.gambar ? `${BASE_URL}/uploads/${g.gambar}` : null);
    } else {
      setEditId(null); setForm(EMPTY); setPreview(null);
    }
    if (fileRef.current) fileRef.current.value = '';
    showModal();
  };

  const handleChange = (e) => {
    if (e.target.name === 'gambar') {
      const f = e.target.files[0];
      setForm({ ...form, gambar: f });
      setPreview(f ? URL.createObjectURL(f) : null);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      if (editId) await updateGunung(editId, fd);
      else await createGunung(fd);
      setSuccess(editId ? 'Gunung diperbarui.' : 'Gunung ditambahkan.');
      hideModal(); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus gunung ini?')) return;
    try { await deleteGunung(id); setSuccess('Gunung dihapus.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  return (
    <AdminLayout title="Data Gunung">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
          <input className="form-control" placeholder="Cari gunung..." value={search}
            onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <button className="btn btn-outline-secondary" onClick={load}>Cari</button>
        </div>
        <button className="btn btn-dark btn-sm" onClick={() => openModal()}>+ Tambah Gunung</button>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-3">
          {list.length === 0 && <p className="text-muted">Belum ada data gunung.</p>}
          {list.map((g) => (
            <div className="col-12 col-sm-6 col-xl-4" key={g.id_gunung}>
              <div className="card border-0 shadow-sm h-100">
                {g.gambar
                  ? <img src={`${BASE_URL}/uploads/${g.gambar}`} className="card-img-top" alt={g.nama_gunung} style={{ height: 160, objectFit: 'cover' }} />
                  : <div className="bg-secondary d-flex align-items-center justify-content-center text-white" style={{ height: 160, fontSize: 48 }}>🏔️</div>
                }
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-1">{g.nama_gunung}</h6>
                  <p className="text-muted small mb-1">📍 {g.lokasi}</p>
                  <p className="text-muted small mb-0">⛰️ {g.ketinggian?.toLocaleString('id-ID')} mdpl</p>
                  {g.deskripsi && <p className="small text-muted mt-2 mb-0" style={{ fontSize: '0.78rem' }}>{g.deskripsi.slice(0, 90)}{g.deskripsi.length > 90 ? '...' : ''}</p>}
                </div>
                <div className="card-footer bg-transparent border-0 d-flex gap-2 p-3 pt-0">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => openModal(g)}>✏️ Edit</button>
                  <button className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => handleDelete(g.id_gunung)}>🗑️ Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">{editId ? '✏️ Edit Gunung' : '➕ Tambah Gunung'}</h6>
              <button type="button" className="btn-close" onClick={hideModal} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <Alert message={error} onClose={() => setError('')} />
                <div className="mb-2"><label className="form-label">Nama Gunung</label>
                  <input name="nama_gunung" className="form-control form-control-sm" value={form.nama_gunung} onChange={handleChange} required /></div>
                <div className="mb-2"><label className="form-label">Lokasi</label>
                  <input name="lokasi" className="form-control form-control-sm" value={form.lokasi} onChange={handleChange} required /></div>
                <div className="mb-2"><label className="form-label">Ketinggian (mdpl)</label>
                  <input type="number" name="ketinggian" className="form-control form-control-sm" value={form.ketinggian} onChange={handleChange} required /></div>
                <div className="mb-2"><label className="form-label">Deskripsi</label>
                  <textarea name="deskripsi" className="form-control form-control-sm" rows={3} value={form.deskripsi} onChange={handleChange} /></div>
                <div className="mb-2"><label className="form-label">Foto</label>
                  <input type="file" name="gambar" className="form-control form-control-sm" ref={fileRef} accept="image/*" onChange={handleChange} />
                  {preview && <img src={preview} className="mt-2 rounded" style={{ maxHeight: 120, maxWidth: '100%' }} alt="preview" />}
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
