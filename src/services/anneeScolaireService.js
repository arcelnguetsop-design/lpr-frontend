import api from './api';

export const anneeScolaireService = {

  getAll: async () => {
    const response = await api.get('/annees');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/annees/active');
    return response.data;
  },

  create: async (libelle) => {
    const [debut, fin] = libelle.split('-');
    const response = await api.post('/annees', {
      libelle,
      date_debut : `${debut}-09-01`,
      date_fin   : `${fin}-07-31`,
    });
    return response.data;
  },

  activer: async (id) => {
    const response = await api.put(`/annees/${id}/activer`);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/annees/${id}/stats`);
    return response.data;
  },
};