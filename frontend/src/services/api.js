import axios from 'axios';

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://linksphere-url-shortener-analytics.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Automatically attach JWT token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ls_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ls_token');
      localStorage.removeItem('ls_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ───────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const getProfile = () => api.get('/api/auth/me');

// ─── LINKS ──────────────────────────────────────────────────────────────────
export const createLink = (data) => api.post('/api/links/create', data);
export const listLinks = (params) => api.get('/api/links/list', { params });
export const toggleLink = (id) => api.patch(`/api/links/${id}/toggle`);
export const deleteLink = (id) => api.delete(`/api/links/${id}`);
export const updateLinkSettings = (id, data) => api.patch(`/api/links/${id}/settings`, data);
export const bulkImport = (formData) =>
  api.post('/api/links/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── ANALYTICS ──────────────────────────────────────────────────────────────
export const getOverview = () => api.get('/api/analytics/overview');
export const getLinkStats = (id) => api.get(`/api/analytics/${id}`);
export const exportData = (id) =>
  api.get(`/api/analytics/${id}/export`, { responseType: 'blob' });

export default api;
