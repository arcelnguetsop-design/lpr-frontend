import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL : API_URL,
  timeout : 15000,
  headers : { 'Content-Type': 'application/json' },
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lpr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Rediriger vers login SEULEMENT si on est sur une page admin
    if (error.response?.status === 401) {
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage) {
        localStorage.removeItem('lpr_token');
        localStorage.removeItem('lpr_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;