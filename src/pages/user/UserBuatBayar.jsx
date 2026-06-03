import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPemesananById, createPembayaran } from '../../api/api';
import UserLayout from '../../components/UserLayout';
import Alert from '../../components/Alert';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const BANK_INFO = [
  { bank: 'BCA',     norek: '1234567890', atas_nama: 'OpenTrip Indonesia' },
  { bank: 'BNI',     norek: '9876543210', atas_nama: 'OpenTrip Indonesia' },
  { bank: 'Mandiri', norek: '1122334455', atas_nama: 'OpenTrip Indonesia' },
];

const WALLET_INFO = [
  { platform: 'GoPay',     nomor: '081234567890', atas_nama: 'OpenTrip' },
  { platform: 'OVO',       nomor: '081234567890', atas_nama: 'OpenTrip' },
  { platform: 'DANA',      nomor: '081234567890', atas_nama: 'OpenTrip' },
  { platform: 'ShopeePay', nomor: '081234567890', atas_nama: 'OpenTrip' },
];

export default function UserBuatBayar() {
  const { id_pemesanan } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metode, setMetode] = useState('transfer_bank');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch data pesanan
  useEffect(() => {
    getPemesananById(id_pemesanan)
      .then((r) => setPesanan(r.data.data))
      .catch(() => setError('Pemesanan tidak ditemukan.'))
      .finally(() => setLoading(false));
  }, [id_pemesanan]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('id_pemesanan', id_pemesanan);
      fd.append('metode', metode);
      if (file) fd.append('bukti_bayar', file);
      await createPembayaran(fd);
      navigate('/pembayaran', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan pembayaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-6">
            <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate('/pesanan')}>
              &larr; Kembali
            </button>
            <h5 className="fw-bold mb-3">Pembayaran</h5>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
              <>
                <Alert message={error} onClose={() => setError('')} />

                {/* Ringkasan pesanan */}
                {pesanan && (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                      <p className="text-muted small mb-1">Ringkasan Pesanan</p>
                      <h6 className="fw-semibold mb-1">{pesanan.nama_trip}</h6>
                      <p className="text-muted small mb-1">{pesanan.nama_gunung}</p>
                      <p className="text-muted small mb-1">
                        {pesanan.tanggal_berangkat} s/d {pesanan.tanggal_pulang}
                      </p>
                      <p className="text-muted small mb-0">{pesanan.jumlah_peserta} peserta</p>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">Total Tagihan</span>
                        <span className="fw-bold fs-6">{fmt(pesanan.total_harga)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Pilih metode */}
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                      <p className="fw-semibold small mb-2">Metode Pembayaran</p>
                      <div className="d-flex flex-column gap-2">
                        {[
                          { value: 'transfer_bank', label: 'Transfer Bank' },
                          { value: 'e_wallet',      label: 'E-Wallet' },
                          { value: 'tunai',         label: 'Tunai' },
                        ].map((m) => (
                          <label
                            key={m.value}
                            className={`d-flex align-items-center gap-2 p-2 rounded border ${metode === m.value ? 'border-dark bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="radio"
                              name="metode"
                              value={m.value}
                              checked={metode === m.value}
                              onChange={() => setMetode(m.value)}
                              className="form-check-input mt-0"
                            />
                            <span className="small fw-semibold">{m.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info transfer bank */}
                  {metode === 'transfer_bank' && (
                    <div className="card border-0 shadow-sm mb-3">
                      <div className="card-body p-3">
                        <p className="fw-semibold small mb-2">Transfer ke salah satu rekening berikut:</p>
                        <table className="table table-sm mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="small">Bank</th>
                              <th className="small">No. Rekening</th>
                              <th className="small">Atas Nama</th>
                            </tr>
                          </thead>
                          <tbody>
                            {BANK_INFO.map((r) => (
                              <tr key={r.bank}>
                                <td className="small fw-semibold">{r.bank}</td>
                                <td><code className="small">{r.norek}</code></td>
                                <td className="small">{r.atas_nama}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-muted small mt-2 mb-0">
                          * Nominal transfer harus sesuai dengan total tagihan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info e-wallet */}
                  {metode === 'e_wallet' && (
                    <div className="card border-0 shadow-sm mb-3">
                      <div className="card-body p-3">
                        <p className="fw-semibold small mb-2">Kirim ke salah satu e-wallet berikut:</p>
                        <table className="table table-sm mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="small">Platform</th>
                              <th className="small">Nomor</th>
                              <th className="small">Atas Nama</th>
                            </tr>
                          </thead>
                          <tbody>
                            {WALLET_INFO.map((w) => (
                              <tr key={w.platform}>
                                <td className="small fw-semibold">{w.platform}</td>
                                <td className="small">{w.nomor}</td>
                                <td className="small">{w.atas_nama}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-muted small mt-2 mb-0">
                          * Nominal transfer harus sesuai dengan total tagihan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info tunai */}
                  {metode === 'tunai' && (
                    <div className="alert alert-secondary small mb-3">
                      Pembayaran tunai dilakukan langsung di kantor kami.
                      Admin akan menghubungi kamu via WhatsApp untuk konfirmasi lokasi.
                    </div>
                  )}

                  {/* Upload bukti */}
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                      <label className="form-label small fw-semibold">
                        Bukti Pembayaran{' '}
                        <span className="text-muted fw-normal">
                          {metode === 'tunai' ? '(opsional)' : '(disarankan dilampirkan sekarang)'}
                        </span>
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        ref={fileRef}
                        accept="image/*,.pdf"
                        onChange={handleFile}
                      />
                      <div className="form-text">JPG, PNG, atau PDF — maks 5 MB</div>
                      {preview && (
                        <img
                          src={preview}
                          className="mt-2 rounded border"
                          style={{ maxHeight: 130, maxWidth: '100%' }}
                          alt="preview"
                        />
                      )}
                    </div>
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-dark" disabled={saving}>
                      {saving && <span className="spinner-border spinner-border-sm me-2" />}
                      Kirim Pembayaran
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
