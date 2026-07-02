import api from './api';

export const nutritionLogService = {
  getAll: (accountId) => api.get(`/nutritionlog?accountId=${accountId}`),
  getById: (id) => api.get(`/nutritionlog/${id}`),
  create: (data) => api.post('/nutritionlog', data),
  update: (id, data) => api.put(`/nutritionlog/${id}`, data),
  delete: (id) => api.delete(`/nutritionlog/${id}`),
};