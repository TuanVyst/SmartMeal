import api from './api';

export const allergyService = {
  getAll: (accountId) => api.get(`/allergy?accountId=${accountId}`),
  getById: (id) => api.get(`/allergy/${id}`),
  create: (data) => api.post('/allergy', data),
  update: (id, data) => api.put(`/allergy/${id}`, data),
  delete: (id) => api.delete(`/allergy/${id}`),
};