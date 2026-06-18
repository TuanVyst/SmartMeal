import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const [usersRes, mealsRes, categoriesRes] = await Promise.allSettled([
      api.get('/auth/accounts'),
      api.get('/recipe'),
      api.get('/ingredient-label'),
    ]);
    const users = usersRes.status === 'fulfilled' ? usersRes.value.data.data || [] : [];
    const meals = mealsRes.status === 'fulfilled' ? mealsRes.value.data.data || [] : [];
    const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.data || [] : [];
    return {
      totalUsers: users.length,
      totalMeals: meals.length,
      totalCategories: categories.length,
      totalFeedback: 0,
    };
  },

  getAllUsers: async () => {
    const res = await api.get('/auth/accounts');
    return res.data.data || [];
  },

  toggleUserStatus: async (id, isActive) => {
    const res = await api.put(`/auth/accounts/${id}`, { isActive });
    return res.data;
  },

  getAllMeals: async () => {
    const res = await api.get('/recipe');
    return res.data.data || [];
  },

  deleteMeal: async (id) => {
    const res = await api.delete(`/recipe/${id}`);
    return res.data;
  },

  getAllCategories: async () => {
    const res = await api.get('/ingredient-label');
    return res.data.data || [];
  },

  createCategory: async (data) => {
    const res = await api.post('/ingredient-label', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/ingredient-label/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/ingredient-label/${id}`);
    return res.data;
  },

  getFeedbackList: async () => {
    const res = await api.get('/feedback');
    return res.data.data || [];
  },

  getFeedbackDetail: async (id) => {
    const res = await api.get(`/feedback/${id}`);
    return res.data.data;
  },

  // Ingredient Tag operations
  getAllIngredientTags: async () => {
    const res = await api.get('/ingredient-tag');
    return res.data.data || [];
  },

  createIngredientTag: async (data) => {
    const res = await api.post('/ingredient-tag', data);
    return res.data;
  },

  updateIngredientTag: async (id, data) => {
    const res = await api.put(`/ingredient-tag/${id}`, data);
    return res.data;
  },

  deleteIngredientTag: async (id) => {
    const res = await api.delete(`/ingredient-tag/${id}`);
    return res.data;
  },

  // Ingredient operations
  getAllIngredients: async () => {
    const res = await api.get('/ingredient');
    return res.data.data || [];
  },

  createIngredient: async (data) => {
    const res = await api.post('/ingredient', data);
    return res.data;
  },

  updateIngredient: async (id, data) => {
    const res = await api.put(`/ingredient/${id}`, data);
    return res.data;
  },

  deleteIngredient: async (id) => {
    const res = await api.delete(`/ingredient/${id}`);
    return res.data;
  },

  // Nutritional Value operations
  getAllNutritionalValues: async () => {
    const res = await api.get('/nutritional-value');
    return res.data.data || [];
  },

  createNutritionalValue: async (data) => {
    const res = await api.post('/nutritional-value', data);
    return res.data;
  },

  updateNutritionalValue: async (id, data) => {
    const res = await api.put(`/nutritional-value/${id}`, data);
    return res.data;
  },

  deleteNutritionalValue: async (id) => {
    const res = await api.delete(`/nutritional-value/${id}`);
    return res.data;
  },

  // Recipe Tag operations
  getAllRecipeTags: async () => {
    const res = await api.get('/recipe-tag');
    return res.data.data || [];
  },

  createRecipeTag: async (data) => {
    const res = await api.post('/recipe-tag', data);
    return res.data;
  },

  updateRecipeTag: async (id, data) => {
    const res = await api.put(`/recipe-tag/${id}`, data);
    return res.data;
  },

  deleteRecipeTag: async (id) => {
    const res = await api.delete(`/recipe-tag/${id}`);
    return res.data;
  },

  // Recipe operations
  getAllRecipes: async () => {
    const res = await api.get('/recipe');
    return res.data.data || [];
  },

  createRecipe: async (data) => {
    const res = await api.post('/recipe', data);
    return res.data;
  },

  updateRecipe: async (id, data) => {
    const res = await api.put(`/recipe/${id}`, data);
    return res.data;
  },

  deleteRecipe: async (id) => {
    const res = await api.delete(`/recipe/${id}`);
    return res.data;
  },

  // Recipe Label operations
  getAllRecipeLabels: async () => {
    const res = await api.get('/recipe-label');
    return res.data.data || [];
  },

  createRecipeLabel: async (data) => {
    const res = await api.post('/recipe-label', data);
    return res.data;
  },

  updateRecipeLabel: async (id, data) => {
    const res = await api.put(`/recipe-label/${id}`, data);
    return res.data;
  },

  deleteRecipeLabel: async (id) => {
    const res = await api.delete(`/recipe-label/${id}`);
    return res.data;
  },

  // Recipe Ingredient operations
  getAllRecipeIngredients: async () => {
    const res = await api.get('/recipe-ingredient');
    return res.data.data || [];
  },

  createRecipeIngredient: async (data) => {
    const res = await api.post('/recipe-ingredient', data);
    return res.data;
  },

  updateRecipeIngredient: async (id, data) => {
    const res = await api.put(`/recipe-ingredient/${id}`, data);
    return res.data;
  },

  deleteRecipeIngredient: async (id) => {
    const res = await api.delete(`/recipe-ingredient/${id}`);
    return res.data;
  },

  // Update dashboard stats to include all relevant data
  getDashboardStats: async () => {
    const [usersRes, mealsRes, categoriesRes, ingredientsRes, tagsRes] = await Promise.allSettled([
      api.get('/auth/accounts'),
      api.get('/recipe'),
      api.get('/ingredient-label'),
      api.get('/ingredient'),
      api.get('/ingredient-tag'),
    ]);
    const users = usersRes.status === 'fulfilled' ? usersRes.value.data.data || [] : [];
    const meals = mealsRes.status === 'fulfilled' ? mealsRes.value.data.data || [] : [];
    const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.data || [] : [];
    const ingredients = ingredientsRes.status === 'fulfilled' ? ingredientsRes.value.data.data || [] : [];
    const tags = tagsRes.status === 'fulfilled' ? tagsRes.value.data.data || [] : [];
    return {
      totalUsers: users.length,
      totalMeals: meals.length,
      totalCategories: categories.length,
      totalIngredients: ingredients.length,
      totalTags: tags.length,
      totalFeedback: 0,
    };
  },
};
