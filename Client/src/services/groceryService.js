import api from './api';

// GroceryList endpoints
export const groceryListService = {
  getAll: () => api.get('/grocerylist'),
  getById: (id) => api.get(`/grocerylist/${id}`),
  create: (data) => api.post('/grocerylist', data),
  update: (id, data) => api.put(`/grocerylist/${id}`, data),
  delete: (id) => api.delete(`/grocerylist/${id}`),
};

// GroceryItem endpoints
export const groceryItemService = {
  getAll: () => api.get('/groceryitem'),
  getById: (id) => api.get(`/groceryitem/${id}`),
  create: (data) => api.post('/groceryitem', data),
  update: (id, data) => api.put(`/groceryitem/${id}`, data),
  delete: (id) => api.delete(`/groceryitem/${id}`),
};