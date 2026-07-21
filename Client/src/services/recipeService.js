import api from './api';

export const recipeService = {
  getAll: () => api.get('/recipe'),
  getById: (id) => api.get(`/recipe/${id}`),
  create: (data) => api.post('/recipe', data),
  update: (id, data) => api.put(`/recipe/${id}`, data),
  delete: (id) => api.delete(`/recipe/${id}`),
  getByIngredients: (ingredientIds) => {
    const qs = ingredientIds.map(id => `ingredientIds=${id}`).join('&');
    return api.get(`/recipe/ingredients?${qs}`);
  },
  suggestFromPantry: (accountId) => api.get(`/recipe/suggest/pantry/${accountId}`),
  getTags: () => api.get('/RecipeTag'),
  suggestByCalories: (targetCalories, tolerancePercent = 20) =>
    api.get(`/recipe/suggest-by-calories?targetCalories=${targetCalories}&tolerancePercent=${tolerancePercent}`),
};
