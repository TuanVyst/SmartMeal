import api from './api';

console.log('[savedRecipeService] loaded, getAll URL:', '/SavedRecipe');

export const savedRecipeService = {
  // SavedRecipe endpoints
  getAll: () => { console.log('[savedRecipeService] getAll called, URL: /SavedRecipe'); return api.get('/SavedRecipe'); },
  getById: (id) => api.get(`/SavedRecipe/${id}`),
  getByCollectionId: (collectionId) => api.get(`/SavedRecipe/collection/${collectionId}`),
  toggle: (data) => api.post('/SavedRecipe/toggle', data),
  create: (data) => api.post('/SavedRecipe', data),
  update: (id, data) => api.put(`/SavedRecipe/${id}`, data),
  delete: (id) => api.delete(`/SavedRecipe/${id}`),

  // Collection endpoints
  getAllCollections: () => api.get('/collection'),
  getCollectionById: (id) => api.get(`/collection/${id}`),
  getDefaultCollection: (accountId) => api.get(`/collection/account/${accountId}/default`),
  createCollection: (data) => api.post('/collection', data),
  updateCollection: (id, data) => api.put(`/collection/${id}`, data),
  deleteCollection: (id) => api.delete(`/collection/${id}`),
};
