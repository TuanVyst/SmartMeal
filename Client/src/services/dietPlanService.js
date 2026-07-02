import api from './api';

export const dietPlanService = {
  getAll: () => api.get('/dietplan'),
  getById: (id) => api.get(`/dietplan/${id}`),
  create: (data) => api.post('/dietplan', data),
  update: (id, data) => api.put(`/dietplan/${id}`, data),
  delete: (id) => api.delete(`/dietplan/${id}`),
};