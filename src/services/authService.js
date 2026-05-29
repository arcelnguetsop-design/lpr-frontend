import api from './api';

export const authService = {

  // ── ADMIN ──────────────────────────────────────────────
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('lpr_token', token);
    localStorage.setItem('lpr_user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('lpr_token');
    localStorage.removeItem('lpr_user');
    window.location.href = '/admin/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('lpr_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('lpr_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = payload.exp * 1000 < Date.now();
      if (expired) {
        localStorage.removeItem('lpr_token');
        localStorage.removeItem('lpr_user');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // ── ENSEIGNANT ─────────────────────────────────────────
  loginEnseignant: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('lpr_enseignant_token', token);
    localStorage.setItem('lpr_enseignant_user', JSON.stringify(user));
    // Injecter le token dans api pour les requêtes suivantes
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  },

  logoutEnseignant: () => {
    localStorage.removeItem('lpr_enseignant_token');
    localStorage.removeItem('lpr_enseignant_user');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/enseignant/login';
  },

  getEnseignantUser: () => {
    const user = localStorage.getItem('lpr_enseignant_user');
    return user ? JSON.parse(user) : null;
  },

  isEnseignantAuthenticated: () => {
    const token = localStorage.getItem('lpr_enseignant_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = payload.exp * 1000 < Date.now();
      if (expired) {
        localStorage.removeItem('lpr_enseignant_token');
        localStorage.removeItem('lpr_enseignant_user');
        return false;
      }
      // Ré-injecter le token si valide
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch {
      return false;
    }
  },
};