import { useEffect, useState, useRef } from 'react';
import {
  getTrips, createTrip, updateTrip, deleteTrip,
  getGunung, createGunung,
} from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';
import useBootstrapModal from '../../hooks/useBootstrapModal';
import { BASE_URL } from '../../api/api';

const EMPTY_TRIP = {
  id_gunung: '', nama_trip: '', tanggal_berangkat: '',
  tanggal_pulang: '', kuota: '', harga: '', include_trip: '', status: 'open',
};
const EMPTY_GUNUNG = { nama_gunung: '', lokasi: '', ketinggian: '', deskripsi: '', gambar: null };
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const statusColor = { open: 'success', full: 'warning', selesai: 'primary', dibatalkan: 'secondary' };

export default function AdminTrips() {
  const [list, setList]           = useState([]);
  const [gunungList, setGunungList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Trip form
  const [trip, setTrip]     = useState(EMPTY_TRIP);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Trip foto
  const [tripFile, setTripFile]       = useState(null);
  const [previewTrip, setPreviewTrip] = useState(null);
  const tripFileRef = useRef();

  // Gunung inline form
  const [showGunungForm, setShowGunungForm] = useState(false);
  const [gunung, setGunung]   = useState(EMPTY_GUNUNG);
  const [savingG, setSavingG] = useState(false);
  const [errorG, setErrorG]   = useState('');
  const [previewG, setPreviewG] = useState(null);

  const fileRef = useRef();
  const { modalRef, showModal, hideModal } = useBootstrapModal();

  // ── Load data ─────────────────────────────────────────────────
  const loadTrips = async () => {
    setLoading(true);
    try {
      const params = {}; if (filterStatus) params.status = filterStatus;
      const res = await getTrips(params);
      setList(res.data.data);
    } finally { setLoading(false); }
  };

  const loadGunung = () =>
    getGunung().then((r) => setGunungList(r.data.data)).catch(() => {});

  useEffect(() => { loadTrips(); loadGunung(); }, []);
  useEffect(() => { loadTrips(); }, [filterStatus]);

  // ── Open modal ────────────────────────────────────────────────
  const openModal = (t = null) => {
    setError(''); setShowGunungForm(false);
    setGunung(EMPTY_GUNUNG); setPreviewG(null);
    setTripFile(null); setPreviewTrip(null);
    if (fileRef.current) fileRef.current.value = '';
    if (tripFileRef.current) tripFileRef.current.value = '';
    if (t) {
      setEditId(t.id_trip);
      setTrip({
        id_gunung: t.id_gunung, nama_trip: t.nama_trip,
        tanggal_berangkat: t.tanggal_berangkat, tanggal_pulang: t.tanggal_pulang,
        kuota: t.kuota, harga: t.harga, include_trip: t.include_trip || '', status: t.status,
      });
      // tampilkan foto lama jika ada
      setPreviewTrip(t.gambar ? `${BASE_URL}/uploads/${t.gambar}` : null);
    } else {
      setEditId(null);
      setTrip(EMPTY_TRIP);
    }
    showModal();
  };

  // ── Simpan trip ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...trip };
      if (tripFile) payload.gambar = tripFile;
      if (editId) await updateTrip(editId, payload);
      else await createTrip(payload);
      setSuccess(editId ? 'Trip berhasil diperbarui.' : 'Trip berhasil ditambahkan.');
      hideModal(); loadTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally { setSaving(false); }
  };

  // ── Simpan gunung baru inline ─────────────────────────────────
  const handleSaveGunung = async (e) => {
    e.preventDefault(); setErrorG(''); setSavingG(true);
    try {
      const fd = new FormData();
      Object.entries(gunung).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      const res = await createGunung(fd);
      const newId = res.data.data?.id_gunung;
      await loadGunung();
      // Auto-pilih gunung yang baru dibuat
      if (newId) setTrip((prev) => ({ ...prev, id_gunung: newId }));
      setGunung(EMPTY_GUNUNG); setPreviewG(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowGunungForm(false);
      setSuccess('Gunung berhasil ditambahkan dan dipilih.');
    } catch (err) {
      setErrorG(err.response?.data?.message || 'Gagal menambahkan gunung.');
    } finally { setSavingG(false); }
  };

  const handleGunungFileChange = (e) => {
    const f = e.target.files[0];
    setGunung((g) => ({ ...g, gambar: f }));
    setPreviewG(f ? URL.createObjectURL(f) : null);
  };

  const handleTripFileChange = (e) => {
    const f = e.target.files[0];
    setTripFile(f || null);
    setPreviewTrip(f ? URL.createObjectURL(f) : null);
  };

  // ── Hapus trip ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Hapus trip ini?')) return;
    try { await deleteTrip(id); setSuccess('Trip dihapus.'); loadTrips(); }
    catch (err) { setError(err.response?.data?.message || 'Gagal.'); }
  };

  return (
    <AdminLayout title="Open Trip & Gunung">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap">
          {['', 'open', 'full', 'selesai', 'dibatalkan'].map((s) => (
            <button key={s}
              className={`btn btn-sm rounded-pill ${filterStatus === s ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus(s)}>
              {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={() => openModal()}>
          + Tambah Trip
        </button>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="px-3">#</th>
                  <th>Nama Trip</th>
                  <th>Gunung</th>
                  <th>Berangkat</th>
                  <th>Pulang</th>
                  <th>Kuota</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted py-4">Belum ada trip.</td></tr>
                )}
                {list.map((t) => (
                  <tr key={t.id_trip}>
                    <td className="small px-3">{t.id_trip}</td>
                    <td className="small fw-semibold">{t.nama_trip}</td>
                    <td className="small">{t.nama_gunung}</td>
                    <td className="small">{t.tanggal_berangkat}</td>
                    <td className="small">{t.tanggal_pulang}</td>
                    <td className="small text-center">{t.kuota}</td>
                    <td className="small">{fmt(t.harga)}</td>
                    <td>
                      <span className={`badge rounded-pill bg-${statusColor[t.status] ?? 'secondary'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          onClick={() => openModal(t)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          onClick={() => handleDelete(t.id_trip)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal Trip ──────────────────────────────────────────── */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h6 className="modal-title fw-bold">
                {editId ? 'Edit Trip' : 'Tambah Trip'}
              </h6>
              <button type="button" className="btn-close" onClick={hideModal} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body pt-2">
                <Alert message={error} onClose={() => setError('')} />

                {/* ── Pilih Gunung ── */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Gunung <span className="text-danger">*</span></label>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={trip.id_gunung}
                      onChange={(e) => setTrip({ ...trip, id_gunung: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Gunung --</option>
                      {gunungList.map((g) => (
                        <option key={g.id_gunung} value={g.id_gunung}>
                          {g.nama_gunung} — {g.lokasi} ({g.ketinggian} mdpl)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={`btn btn-sm ${showGunungForm ? 'btn-secondary' : 'btn-outline-primary'} text-nowrap`}
                      onClick={() => { setShowGunungForm(v => !v); setErrorG(''); }}
                    >
                      {showGunungForm ? '✕ Batal' : '+ Gunung Baru'}
                    </button>
                  </div>

                  {/* ── Form tambah gunung inline ── */}
                  {showGunungForm && (
                    <div className="border rounded p-3 mt-2 bg-light">
                      <p className="small fw-semibold mb-2 text-primary">Tambah Gunung Baru</p>
                      <Alert message={errorG} onClose={() => setErrorG('')} />
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small">Nama Gunung <span className="text-danger">*</span></label>
                          <input className="form-control form-control-sm" value={gunung.nama_gunung}
                            onChange={(e) => setGunung({ ...gunung, nama_gunung: e.target.value })} required={showGunungForm} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Lokasi <span className="text-danger">*</span></label>
                          <input className="form-control form-control-sm" value={gunung.lokasi}
                            onChange={(e) => setGunung({ ...gunung, lokasi: e.target.value })} required={showGunungForm} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Ketinggian (mdpl) <span className="text-danger">*</span></label>
                          <input type="number" className="form-control form-control-sm" value={gunung.ketinggian}
                            onChange={(e) => setGunung({ ...gunung, ketinggian: e.target.value })} required={showGunungForm} />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label small">Foto</label>
                          <input type="file" className="form-control form-control-sm" ref={fileRef}
                            accept="image/*" onChange={handleGunungFileChange} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small">Deskripsi</label>
                          <textarea className="form-control form-control-sm" rows={2} value={gunung.deskripsi}
                            onChange={(e) => setGunung({ ...gunung, deskripsi: e.target.value })} />
                        </div>
                        {previewG && (
                          <div className="col-12">
                            <img src={previewG} className="rounded" style={{ maxHeight: 90, maxWidth: '100%' }} alt="preview" />
                          </div>
                        )}
                        <div className="col-12">
                          <button type="button" className="btn btn-primary btn-sm rounded-pill px-4"
                            onClick={handleSaveGunung} disabled={savingG}>
                            {savingG && <span className="spinner-border spinner-border-sm me-1" />}
                            Simpan Gunung
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Data Trip ── */}
                <hr className="my-2" />
                <p className="small fw-semibold mb-2">Detail Trip</p>

                <div className="mb-2">
                  <label className="form-label small">Nama Trip <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={trip.nama_trip}
                    onChange={(e) => setTrip({ ...trip, nama_trip: e.target.value })} required />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label small">Tgl Berangkat <span className="text-danger">*</span></label>
                    <input type="date" className="form-control form-control-sm" value={trip.tanggal_berangkat}
                      onChange={(e) => setTrip({ ...trip, tanggal_berangkat: e.target.value })} required />
                  </div>
                  <div className="col">
                    <label className="form-label small">Tgl Pulang <span className="text-danger">*</span></label>
                    <input type="date" className="form-control form-control-sm" value={trip.tanggal_pulang}
                      onChange={(e) => setTrip({ ...trip, tanggal_pulang: e.target.value })} required />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label small">Kuota <span className="text-danger">*</span></label>
                    <input type="number" min="1" className="form-control form-control-sm" value={trip.kuota}
                      onChange={(e) => setTrip({ ...trip, kuota: e.target.value })} required />
                  </div>
                  <div className="col">
                    <label className="form-label small">Harga / orang (Rp) <span className="text-danger">*</span></label>
                    <input type="number" min="0" className="form-control form-control-sm" value={trip.harga}
                      onChange={(e) => setTrip({ ...trip, harga: e.target.value })} required />
                  </div>
                </div>

                {/* Include / Fasilitas */}
                <div className="mb-2">
                  <label className="form-label small">
                    Include <span className="text-muted fw-normal">(fasilitas yang didapat peserta)</span>
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder={'Contoh:\n- Guide berpengalaman\n- Makan 3x sehari\n- Tenda & sleeping bag\n- P3K'}
                    value={trip.include_trip}
                    onChange={(e) => setTrip({ ...trip, include_trip: e.target.value })}
                  />
                  <div className="form-text">Tulis tiap item di baris baru diawali tanda "-"</div>
                </div>

                {/* Foto Trip */}
                <div className="mb-2">
                  <label className="form-label small">
                    Foto Trip {!editId && <span className="text-danger">*</span>}
                    {editId && <span className="text-muted fw-normal"> (kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    ref={tripFileRef}
                    accept="image/*"
                    onChange={handleTripFileChange}
                    required={!editId}
                  />
                  {previewTrip && (
                    <div className="mt-2">
                      <img
                        src={previewTrip}
                        alt="preview trip"
                        className="rounded"
                        style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                {editId && (
                  <div className="mb-2">
                    <label className="form-label small">Status</label>
                    <select className="form-select form-select-sm" value={trip.status}
                      onChange={(e) => setTrip({ ...trip, status: e.target.value })}>
                      {['open', 'full', 'selesai', 'dibatalkan'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary btn-sm rounded-pill px-4" onClick={hideModal}>Batal</button>
                <button type="submit" className="btn btn-dark btn-sm rounded-pill px-4" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-1" />}
                  Simpan Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
