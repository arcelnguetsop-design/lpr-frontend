import api from './api';

export const eleveService = {

  // Inscription publique
  inscrire: async (data) => {
    const response = await api.post('/inscriptions', data);
    return response.data;
  },

  // Liste élèves (admin)
  getListe: async (params = {}) => {
    const response = await api.get('/eleves/liste', { params });
    return response.data;
  },

  // Stats dashboard
  getStats: async () => {
    const response = await api.get('/eleves/stats');
    return response.data;
  },

  // Fiche élève
  getById: async (id) => {
    const response = await api.get(`/eleves/${id}`);
    return response.data;
  },

  // Modifier statut
  updateStatut: async (id, statut) => {
    const response = await api.put(`/eleves/${id}/statut`, { statut });
    return response.data;
  },

  // Modifier élève
  update: async (id, data) => {
    const response = await api.put(`/eleves/${id}`, data);
    return response.data;
  },

  // Export Excel
  exportExcel: async (params = {}) => {
    const response = await api.get('/eleves/export/excel', {
      params,
      responseType: 'blob',
    });
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', 'eleves_lpr.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Fiche PDF
  getPDF: async (id) => {
    const response = await api.get(`/eleves/${id}/pdf`, {
      responseType: 'blob',
    });
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `fiche_eleve_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};