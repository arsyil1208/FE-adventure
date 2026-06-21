import { useEffect, useState } from 'react';
import { getPemesanan, updateStatusPemesanan, deletePemesanan } from '../../api/api';
import AdminLayout from '../../components/AdminLayout';
import Alert from '../../components/Alert';
import useBootstrapModal from '../../hooks/useBootstrapModal';
import { BASE_URL } from '../../api/api';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusColor = {
  pending: 'warning',
  dikonfirmasi: 'success',
  dibatalkan: 'secondary',
  selesai: 'primary',
};

export default function AdminPemesanan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const { modalRef, showModal, hideModal } = useBootstrapModal();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await getPemesanan(params);
      setList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openDetail = (p) => {
    setSelected(p);
    showModal();
  };

  const changeStatus = async (id, status) => {
    if (!confirm(`Ubah status ke "${status}"?`)) return;
    try {
      await updateStatusPemesanan(id, status);
      setSuccess(`Status diubah ke "${status}".`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal.');
    }
  };

  const hapus = async (id) => {
    if (!confirm('Hapus pemesanan ini?')) return;
    try {
      await deletePemesanan(id);
      setSuccess('Pemesanan dihapus.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal.');
    }
  };

  const stats = [
    { label: 'Total',        value: list.length,                                    color: 'primary' },
    { label: 'Pending',      value: list.filter(i => i.status === 'pending').length, color: 'warning' },
    { label: 'Dikonfirmasi', value: list.filter(i => i.status === 'dikonfirmasi').length, color: 'success' },
    { label: 'Selesai',      value: list.filter(i => i.status === 'selesai').length, color: 'info' },
  ];

  return (
    <AdminLayout title="Manajemen Pemesanan">
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      {/* Statistik */}
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className={`card border-0 shadow-sm bg-${s.color} ${s.color === 'warning' ? '' : 'text-white'}`}>
              <div className="card-body py-3 px-3">
                <div className="small">{s.label}</div>
                <div className="fw-bold fs-4">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {['', 'pending', 'dikonfirmasi', 'dibatalkan', 'selesai'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle bg-white shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Pelanggan</th>
                <th>Trip</th>
                <th>Gunung</th>
                <th>Peserta</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">Tidak ada data.</td>
                </tr>
              )}
              {list.map((p) => (
                <tr key={p.id_pemesanan}>
                  <td className="small">{p.id_pemesanan}</td>
                  <td className="small">
                    <div className="fw-semibold">{p.nama_user}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{p.email}</div>
                  </td>
                  <td className="small">{p.nama_trip}</td>
                  <td className="small">{p.nama_gunung}</td>
                  <td className="small text-center">{p.jumlah_peserta}</td>
                  <td className="small">{fmt(p.total_harga)}</td>
                  <td className="small">
                    {p.tanggal_pesan ? new Date(p.tanggal_pesan).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td>
                    <span className={`badge bg-${statusColor[p.status] ?? 'secondary'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {/* Tombol Detail */}
                      <button
                        className="btn btn-sm btn-outline-info"
                        style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                        onClick={() => openDetail(p)}
                      >
                        Detail
                      </button>

                      {p.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                            onClick={() => changeStatus(p.id_pemesanan, 'dikonfirmasi')}
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                            onClick={() => changeStatus(p.id_pemesanan, 'dibatalkan')}
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {p.status === 'dikonfirmasi' && (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                          onClick={() => changeStatus(p.id_pemesanan, 'selesai')}
                        >
                          Selesai
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: '0.72rem', padding: '2px 7px' }}
                        onClick={() => hapus(p.id_pemesanan)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">Detail Pemesanan #{selected?.id_pemesanan}</h6>
              <button type="button" className="btn-close" onClick={hideModal} />
            </div>
            <div className="modal-body">
              {selected && (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted small">Status</div>
                    <span className={`badge bg-${statusColor[selected.status] ?? 'secondary'}`}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small">Tanggal Pesan</div>
                    <div className="small">
                      {selected.tanggal_pesan
                        ? new Date(selected.tanggal_pesan).toLocaleDateString('id-ID')
                        : '-'}
                    </div>
                  </div>
                  <div className="col-12"><hr className="my-1" /></div>

                  <div className="col-md-6">
                    <div className="text-muted small">Nama Pelanggan</div>
                    <div className="fw-semibold">{selected.nama_user}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">Email</div>
                    <div className="small">{selected.email}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">NIK</div>
                    <div className="small font-monospace">{selected.nik || '-'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">No. HP</div>
                    <div className="small">{selected.pelanggan_no_hp || '-'}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">Kontak Darurat</div>
                    <div className="small">{selected.kontak_darurat || '-'}</div>
                  </div>
                  <div className="col-12"><hr className="my-1" /></div>

                  <div className="col-md-6">
                    <div className="text-muted small">Trip</div>
                    <div className="fw-semibold">{selected.nama_trip}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">Gunung</div>
                    <div className="small">{selected.nama_gunung}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Tgl Berangkat</div>
                    <div className="small">{selected.tanggal_berangkat || '-'}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Tgl Pulang</div>
                    <div className="small">{selected.tanggal_pulang || '-'}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-muted small">Jumlah Peserta</div>
                    <div className="fw-semibold">{selected.jumlah_peserta} orang</div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-muted small">Total Harga</div>
                    <div className="fw-bold text-success fs-6">{fmt(selected.total_harga)}</div>
                  </div>
                  {selected.deskripsi && (
                    <div className="col-12">
                      <div className="text-muted small">Catatan</div>
                      <div className="small">{selected.deskripsi}</div>
                    </div>
                  )}

                  {/* ── Bukti Pembayaran ── */}
                  <div className="col-12"><hr className="my-1" /></div>
                  <div className="col-12">
                    <div className="text-muted small mb-1 fw-semibold">Pembayaran</div>
                  </div>
                  {selected.pembayaran ? (
                    <>
                      <div className="col-md-4">
                        <div className="text-muted small">Metode</div>
                        <div className="small text-capitalize">
                          {selected.pembayaran.metode?.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-muted small">Status Bayar</div>
                        <span className={`badge bg-${
                          selected.pembayaran.status === 'lunas'    ? 'success'
                          : selected.pembayaran.status === 'gagal'  ? 'danger'
                          : selected.pembayaran.status === 'refund' ? 'info'
                          : 'warning'
                        }`}>
                          {selected.pembayaran.status}
                        </span>
                      </div>
                      <div className="col-md-4">
                        <div className="text-muted small">Tanggal Bayar</div>
                        <div className="small">
                          {selected.pembayaran.tanggal_bayar
                            ? new Date(selected.pembayaran.tanggal_bayar).toLocaleDateString('id-ID')
                            : '-'}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="text-muted small mb-1">Bukti Transfer</div>
                        {selected.pembayaran.bukti_bayar ? (
                          <div>
                            <a
                              href={`${BASE_URL}/uploads/${selected.pembayaran.bukti_bayar}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={`${BASE_URL}/uploads/${selected.pembayaran.bukti_bayar}`}
                                alt="Bukti pembayaran"
                                className="rounded border"
                                style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                              />
                            </a>
                            <div className="mt-1">
                              <a
                                href={`${BASE_URL}/uploads/${selected.pembayaran.bukti_bayar}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="small text-primary"
                              >
                                Buka gambar penuh ↗
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted small fst-italic">Belum ada bukti diunggah.</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="col-12">
                      <div className="text-muted small fst-italic">Belum ada data pembayaran.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selected?.status === 'pending' && (
                <>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => { changeStatus(selected.id_pemesanan, 'dikonfirmasi'); hideModal(); }}
                  >
                    ✓ Konfirmasi
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => { changeStatus(selected.id_pemesanan, 'dibatalkan'); hideModal(); }}
                  >
                    ✕ Batalkan
                  </button>
                </>
              )}
              {selected?.status === 'dikonfirmasi' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { changeStatus(selected.id_pemesanan, 'selesai'); hideModal(); }}
                >
                  Tandai Selesai
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={hideModal}>Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
