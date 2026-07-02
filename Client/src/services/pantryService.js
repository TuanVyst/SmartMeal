import api from './api';

export const pantryService = {
  getAll: () => api.get('/pantry'),
  getById: (id) => api.get(`/pantry/${id}`),
  create: (data) => api.post('/pantry', data),
  update: (id, data) => api.put(`/pantry/${id}`, data),
  delete: (id) => api.delete(`/pantry/${id}`),
};