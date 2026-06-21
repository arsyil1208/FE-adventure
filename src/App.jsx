import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTrips from './pages/admin/AdminTrips';
import AdminPemesanan from './pages/admin/AdminPemesanan';
import AdminPembayaran from './pages/admin/AdminPembayaran';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPelanggan from './pages/admin/AdminPelanggan';
import AdminGunung from './pages/admin/AdminGunung';

// User pages
import UserTrips from './pages/user/UserTrips';
import UserBuatPesan from './pages/user/UserBuatPesan';
import UserPesanan from './pages/user/UserPesanan';
import UserPembayaran from './pages/user/UserPembayaran';
import UserBuatBayar from './pages/user/UserBuatBayar';
import UserProfil from './pages/user/UserProfil';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── PUBLIC ───────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── ADMIN ────────────────────────────────── */}
          <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/trips" element={<PrivateRoute adminOnly><AdminTrips /></PrivateRoute>} />
          <Route path="/admin/pemesanan" element={<PrivateRoute adminOnly><AdminPemesanan /></PrivateRoute>} />
          <Route path="/admin/pembayaran" element={<PrivateRoute adminOnly><AdminPembayaran /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/pelanggan" element={<PrivateRoute adminOnly><AdminPelanggan /></PrivateRoute>} />
          <Route path="/admin/gunung" element={<PrivateRoute adminOnly><AdminGunung /></PrivateRoute>} />

          {/* ── USER (harus login) ────────────────────── */}
          <Route path="/trips" element={<PrivateRoute><UserTrips /></PrivateRoute>} />
          <Route path="/pesan/:id_trip" element={<PrivateRoute><UserBuatPesan /></PrivateRoute>} />
          <Route path="/pesanan" element={<PrivateRoute><UserPesanan /></PrivateRoute>} />
          <Route path="/pembayaran" element={<PrivateRoute><UserPembayaran /></PrivateRoute>} />
          <Route path="/bayar/:id_pemesanan" element={<PrivateRoute><UserBuatBayar /></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><UserProfil /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
