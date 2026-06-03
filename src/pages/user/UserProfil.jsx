import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword, getPelangganByUserId, createPelanggan, updatePelanggan } from '../../api/api';
import UserLayout from '../../components/UserLayout';
import Alert from '../../components/Alert';

const EMPTY = { nik: '', nama_lengkap: '', jenis_kelamin: 'L', tanggal_lahir: '', no_hp: '', alamat: '', kontak_darurat: '' };

export default function UserProfil() {
  const { user } = useAuth();
  const [pelangganId, setPelangganId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [pwForm, setPwForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [profilError, setProfilError] = useState('');
  const [profilSuccess, setProfilSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingProfil, setSavingProfil] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [loadingProfil, setLoadingProfil] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    if (!user) return;
    getPelangganByUserId(user.id_user)
      .then((r) => {
        const p = r.data.data;
        setPelangganId(p.id_pelanggan);
        setForm({
          nik: p.nik || '', nama_lengkap: p.nama_lengkap || '',
          jenis_kelamin: p.jenis_kelamin || 'L', tanggal_lahir: p.tanggal_lahir || '',
          no_hp: p.no_hp || '', alamat: p.alamat || '', kontak_darurat: p.kontak_darurat || '',
        });
      })
      .catch(() => { /* profil belum ada */ })
      .finally(() => setLoadingProfil(false));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfil = async (e) => {
    e.preventDefault(); setProfilError(''); setSavingProfil(true);
    try {
      if (pelangganId) await updatePelanggan(pelangganId, form);
      else await createPelanggan({ ...form, id_user: user.id_user });
      setProfilSuccess('Profil berhasil disimpan.');
    } catch (err) {
      setProfilError(err.response?.data?.message || 'Gagal menyimpan.');
    } finally { setSavingProfil(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault(); setPwError(''); setPwSuccess('');
    if (pwForm.password_baru !== pwForm.konfirmasi) { setPwError('Konfirmasi password tidak cocok.'); return; }
    setSavingPw(true);
    try {
      await changePassword({ password_lama: pwForm.password_lama, password_baru: pwForm.password_baru });
      setPwSuccess('Password berhasil diubah.');
      setPwForm({ password_lama: '', password_baru: '', konfirmasi: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Gagal.');
    } finally { setSavingPw(false); }
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7">
            {/* Header akun */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 52, height: 52, fontSize: 20 }}>
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold">{user?.nama}</div>
                  <div className="text-muted small">{user?.email}</div>
                  <span className="badge bg-secondary mt-1">Pelanggan</span>
                </div>
              </div>
            </div>

            {/* Tab */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
                  📝 Data Pendaki
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                  🔒 Keamanan
                </button>
              </li>
            </ul>

            {/* Tab: Profil Pelanggan */}
            {activeTab === 'profil' && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <p className="text-muted small mb-3">
                    Data ini diperlukan untuk proses pendakian. Pastikan sesuai KTP.
                  </p>
                  {loadingProfil ? (
                    <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div>
                  ) : (
                    <>
                      <Alert message={profilError} onClose={() => setProfilError('')} />
                      <Alert type="success" message={profilSuccess} onClose={() => setProfilSuccess('')} />
                      <form onSubmit={handleSaveProfil}>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">NIK <span className="text-danger">*</span></label>
                            <input name="nik" className="form-control form-control-sm" placeholder="16 digit NIK KTP"
                              value={form.nik} onChange={handleChange} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-semibold">Nama Lengkap <span className="text-danger">*</span></label>
                            <input name="nama_lengkap" className="form-control form-control-sm" placeholder="Sesuai KTP"
                              value={form.nama_lengkap} onChange={handleChange} required />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold">Jenis Kelamin</label>
                            <select name="jenis_kelamin" className="form-select form-select-sm" value={form.jenis_kelamin} onChange={handleChange}>
                              <option value="L">♂ Laki-laki</option>
                              <option value="P">♀ Perempuan</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold">Tanggal Lahir <span className="text-danger">*</span></label>
                            <input type="date" name="tanggal_lahir" className="form-control form-control-sm"
                              value={form.tanggal_lahir} onChange={handleChange} required />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-semibold">No. HP <span className="text-danger">*</span></label>
                            <input name="no_hp" className="form-control form-control-sm" placeholder="08xx..."
                              value={form.no_hp} onChange={handleChange} required />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Alamat</label>
                            <textarea name="alamat" className="form-control form-control-sm" rows={2}
                              placeholder="Alamat lengkap sesuai KTP" value={form.alamat} onChange={handleChange} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-semibold">Kontak Darurat</label>
                            <input name="kontak_darurat" className="form-control form-control-sm"
                              placeholder="Nama & no. HP keluarga / kerabat"
                              value={form.kontak_darurat} onChange={handleChange} />
                            <div className="form-text">Dihubungi jika terjadi keadaan darurat saat pendakian.</div>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-dark btn-sm mt-3" disabled={savingProfil}>
                          {savingProfil && <span className="spinner-border spinner-border-sm me-1" />}
                          Simpan Data Pendaki
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Password */}
            {activeTab === 'password' && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <Alert message={pwError} onClose={() => setPwError('')} />
                  <Alert type="success" message={pwSuccess} onClose={() => setPwSuccess('')} />
                  <form onSubmit={handleChangePw}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Password Lama</label>
                      <input type="password" className="form-control form-control-sm"
                        value={pwForm.password_lama} onChange={(e) => setPwForm({ ...pwForm, password_lama: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Password Baru</label>
                      <input type="password" className="form-control form-control-sm"
                        value={pwForm.password_baru} onChange={(e) => setPwForm({ ...pwForm, password_baru: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Konfirmasi Password Baru</label>
                      <input type="password" className="form-control form-control-sm"
                        value={pwForm.konfirmasi} onChange={(e) => setPwForm({ ...pwForm, konfirmasi: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-dark btn-sm" disabled={savingPw}>
                      {savingPw && <span className="spinner-border spinner-border-sm me-1" />}
                      Ganti Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
