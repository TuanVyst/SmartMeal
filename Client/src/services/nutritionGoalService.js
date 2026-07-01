import api from './api';

export const nutritionGoalService = {
  getAll: (accountId) => api.get(`/nutritiongoal?accountId=${accountId}`),
  getById: (id) => api.get(`/nutritiongoal/${id}`),
  create: (data) => api.post('/nutritiongoal', data),
  update: (id, data) => api.put(`/nutritiongoal/${id}`, data),
  delete: (id) => api.delete(`/nutritiongoal/${id}`),
};