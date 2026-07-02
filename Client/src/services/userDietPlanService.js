import api from './api';

export const userDietPlanService = {
  getAll: () => api.get('/userdietplan'),
  getById: (id) => api.get(`/userdietplan/${id}`),
  create: (data) => api.post('/userdietplan', data),
  update: (id, data) => api.put(`/userdietplan/${id}`, data),
  delete: (id) => api.delete(`/userdietplan/${id}`),
};