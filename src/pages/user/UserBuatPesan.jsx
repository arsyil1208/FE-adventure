import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, createPemesanan } from '../../api/api';
import UserLayout from '../../components/UserLayout';
import Alert from '../../components/Alert';
import { formatTripRange } from '../../utils/date';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function UserBuatPesan() {
  const { id_trip } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumlah] = useState(1);
  const [deskripsi, setDeskripsi] = useState('');
  const { user } = useAuth();
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState(user?.nama || '');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [kontakDarurat, setKontakDarurat] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTripById(id_trip)
      .then((r) => setTrip(r.data.data))
      .catch(() => setError('Trip tidak ditemukan.'))
      .finally(() => setLoading(false));
  }, [id_trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await createPemesanan({
        id_trip,
        jumlah_peserta: jumlah,
        deskripsi,
        nik,
        nama_lengkap: nama,
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir,
        no_hp: noHp,
        email,
        kontak_darurat: kontakDarurat
      });
      navigate(`/bayar/${res.data.data.id_pemesanan}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pemesanan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate('/trips')}>
              &larr; Kembali
            </button>
            <h5 className="fw-bold mb-3">Buat Pemesanan</h5>

            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
              <>
                <Alert message={error} onClose={() => setError('')} />

                {trip && (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                      <h6 className="fw-semibold mb-1">{trip.nama_trip}</h6>
                      <p className="text-muted small mb-1">{trip.nama_gunung} — {trip.lokasi}</p>
                      <p className="text-muted small mb-1">{formatTripRange(trip.tanggal_berangkat, trip.tanggal_pulang)}</p>
                      <p className="text-muted small mb-0">Kuota: {trip.kuota} orang</p>
                      <hr className="my-2" />
                      <p className="fw-bold mb-0">{fmt(trip.harga)} / orang</p>
                    </div>
                  </div>
                )}

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Jumlah Peserta</label>
                        <input type="hidden" value={1} name="jumlah_peserta" />
                        <div className="form-control">1 orang</div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Catatan <span className="text-muted small">(opsional)</span></label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Contoh: alergi, kondisi kesehatan, dll."
                          value={deskripsi}
                          onChange={(e) => setDeskripsi(e.target.value)}
                        />
                      </div>

                      <hr />
                      <h6 className="fw-semibold">Data Diri</h6>
                      <div className="mb-3">
                        <label className="form-label">NIK</label>
                        <input className="form-control" value={nik} onChange={(e) => setNik(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nama Lengkap</label>
                        <input className="form-control" value={nama} onChange={(e) => setNama(e.target.value)} required />
                      </div>
                      <div className="row">
                        <div className="col-6 mb-3">
                          <label className="form-label">Jenis Kelamin</label>
                          <select className="form-select" value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} required>
                            <option value="">Pilih</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label">Tanggal Lahir</label>
                          <input type="date" className="form-control" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)} required />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">No. HP</label>
                        <input className="form-control" value={noHp} onChange={(e) => setNoHp(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Kontak Darurat</label>
                        <input className="form-control" value={kontakDarurat} onChange={(e) => setKontakDarurat(e.target.value)} />
                      </div>

                      {trip && (
                        <div className="d-flex justify-content-between p-2 bg-light rounded mb-3 small">
                          <span>Total ({jumlah} orang)</span>
                          <span className="fw-bold">{fmt(trip.harga * jumlah)}</span>
                        </div>
                      )}

                      <div className="d-grid">
                        <button type="submit" className="btn btn-dark" disabled={saving}>
                          {saving && <span className="spinner-border spinner-border-sm me-2" />}
                          Lanjut ke Pembayaran
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
