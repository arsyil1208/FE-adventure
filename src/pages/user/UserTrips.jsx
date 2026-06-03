import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips } from '../../api/api';
import UserLayout from '../../components/UserLayout';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const BASE_URL = 'http://localhost:3000';

export default function UserTrips() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTrips({ status: 'open' })
      .then((r) => setList(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter(
    (t) =>
      t.nama_trip?.toLowerCase().includes(search.toLowerCase()) ||
      t.nama_gunung?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <UserLayout>
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          <h5 className="fw-bold mb-1">Open Trip Tersedia</h5>
          <p className="text-muted small mb-3">Pilih destinasi pendakian favoritmu</p>
          <input
            className="form-control"
            style={{ maxWidth: 320 }}
            placeholder="🔍 Cari trip atau gunung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="fs-1">🏔️</p>
            <p>Tidak ada trip yang ditemukan.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((t) => (
              <div className="col-12 col-sm-6 col-lg-4" key={t.id_trip}>
                <div className="card border-0 shadow h-100" style={{ borderRadius: 14, overflow: 'hidden' }}>
                  {t.gambar ? (
                    <img src={`${BASE_URL}/uploads/${t.gambar}`} className="card-img-top" alt={t.nama_gunung}
                      style={{ height: 190, objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-secondary d-flex align-items-center justify-content-center text-white"
                      style={{ height: 190, fontSize: 52 }}>🏔️</div>
                  )}
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{t.nama_trip}</h6>
                      <span className="badge bg-success rounded-pill">Open</span>
                    </div>
                    <p className="text-muted small mb-1">📍 {t.nama_gunung} — {t.lokasi}</p>
                    <p className="text-muted small mb-1">📅 {t.tanggal_berangkat} s/d {t.tanggal_pulang}</p>
                    <p className="text-muted small mb-1">👥 Kuota: {t.kuota} orang</p>
                    <p className="fw-bold mb-0">{fmt(t.harga)}<span className="fw-normal text-muted small"> / orang</span></p>

                    {/* Include */}
                    {t.include_trip && (
                      <div className="mt-2 pt-2 border-top">
                        <p className="small fw-semibold mb-1">Sudah Termasuk:</p>
                        <ul className="mb-0 ps-3">
                          {t.include_trip.split('\n').filter(l => l.trim()).map((item, i) => (
                            <li key={i} className="small text-muted">
                              {item.replace(/^[-•]\s*/, '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-transparent border-0 p-3 pt-0">
                    <button className="btn btn-dark w-100 rounded-pill" onClick={() => navigate(`/pesan/${t.id_trip}`)}>
                      Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
