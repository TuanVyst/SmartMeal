import api from './api';

export const recipeService = {
  getAll: () => api.get('/recipe'),
  getById: (id) => api.get(`/recipe/${id}`),
  create: (data) => api.post('/recipe', data),
  update: (id, data) => api.put(`/recipe/${id}`, data),
  delete: (id) => api.delete(`/recipe/${id}`),
  getByIngredients: (ingredientIds) => api.get('/recipe/ingredients', { params: { ingredientIds } }),
  suggestFromPantry: (accountId) => api.get(`/recipe/suggest/pantry/${accountId}`),
  getTags: () => api.get('/RecipeTag'),
};
