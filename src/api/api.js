import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Attach JWT token ke setiap request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — hanya redirect jika bukan request login/register/me
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const is401 = err.response?.status === 401;
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/me');

    if (is401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

// Convert plain object ke FormData
const toFormData = (obj) => {
  const fd = new FormData();

  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      fd.append(k, v);
    }
  });

  return fd;
};

const FORM_HEADER = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

// ── AUTH ──────────────────────────────────────────────────────────
// LOGIN & REGISTER pakai JSON biasa, bukan FormData
export const login = (data) =>
  API.post('/auth/login', data);

export const register = (data) =>
  API.post('/auth/register', data);

export const getMe = () =>
  API.get('/auth/me');

export const changePassword = (data) =>
  API.put('/auth/change-password', data);

// ── DASHBOARD ────────────────────────────────────────────────────
export const getDashboard = () =>
  API.get('/dashboard');

// ── GUNUNG ───────────────────────────────────────────────────────
export const getGunung = (params) =>
  API.get('/trips/gunung', { params });

export const getGunungById = (id) =>
  API.get(`/trips/gunung/${id}`);

export const createGunung = (formData) =>
  API.post('/trips/gunung', formData, FORM_HEADER);

export const updateGunung = (id, fd) =>
  API.put(`/trips/gunung/${id}`, fd, FORM_HEADER);

export const deleteGunung = (id) =>
  API.delete(`/trips/gunung/${id}`);

// ── TRIPS ────────────────────────────────────────────────────────
export const getTrips = (params) =>
  API.get('/trips', { params });

export const getTripById = (id) =>
  API.get(`/trips/${id}`);

export const createTrip = (data) =>
  API.post('/trips', toFormData(data), FORM_HEADER);

export const updateTrip = (id, data) =>
  API.put(`/trips/${id}`, toFormData(data), FORM_HEADER);

export const deleteTrip = (id) =>
  API.delete(`/trips/${id}`);

// ── PEMESANAN ────────────────────────────────────────────────────
export const getPemesanan = (params) =>
  API.get('/pemesanan', { params });

export const getPemesananById = (id) =>
  API.get(`/pemesanan/${id}`);

export const createPemesanan = (data) =>
  API.post('/pemesanan', toFormData(data), FORM_HEADER);

export const updateStatusPemesanan = (id, status) =>
  API.put(
    `/pemesanan/${id}/status`,
    toFormData({ status }),
    FORM_HEADER
  );

export const deletePemesanan = (id) =>
  API.delete(`/pemesanan/${id}`);

// ── PEMBAYARAN ───────────────────────────────────────────────────
export const getPembayaran = (params) =>
  API.get('/pembayaran', { params });

export const getPembayaranById = (id) =>
  API.get(`/pembayaran/${id}`);

export const createPembayaran = (formData) =>
  API.post('/pembayaran', formData, FORM_HEADER);

export const updateStatusPembayaran = (id, status) =>
  API.put(
    `/pembayaran/${id}/status`,
    toFormData({ status }),
    FORM_HEADER
  );

export const uploadBukti = (id, fd) =>
  API.put(`/pembayaran/${id}/bukti`, fd, FORM_HEADER);

export const deletePembayaran = (id) =>
  API.delete(`/pembayaran/${id}`);

// ── PELANGGAN ────────────────────────────────────────────────────
export const getAllPelanggan = () =>
  API.get('/pelanggan');

export const getPelangganByUserId = (id_user) =>
  API.get(`/pelanggan/user/${id_user}`);

export const createPelanggan = (data) =>
  API.post('/pelanggan', toFormData(data), FORM_HEADER);

export const updatePelanggan = (id, data) =>
  API.put(`/pelanggan/${id}`, toFormData(data), FORM_HEADER);

export const deletePelanggan = (id) =>
  API.delete(`/pelanggan/${id}`);

// ── USERS ────────────────────────────────────────────────────────
export const getUsers = () =>
  API.get('/users');

export const getUserById = (id) =>
  API.get(`/users/${id}`);

export const updateUser = (id, data) =>
  API.put(`/users/${id}`, toFormData(data), FORM_HEADER);

export const deleteUser = (id) =>
  API.delete(`/users/${id}`);

export const BASE_URL = 'http://localhost:3000';

export default API;