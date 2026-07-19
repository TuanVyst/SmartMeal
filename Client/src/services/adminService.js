import api from './api';

export const adminService = {
  // Update dashboard stats to include all relevant data
  getDashboardStats: async () => {
    const [usersRes, recipesRes, categoriesRes, ingredientsRes, tagsRes] = await Promise.allSettled([
      api.get('/auth/accounts'), // Placeholder if Auth/Account missing
      api.get('/Recipe'),
      api.get('/IngredientLabel'),
      api.get('/Ingredient'),
      api.get('/IngredientTag'),
    ]);
    const users = usersRes.status === 'fulfilled' ? usersRes.value.data.data || [] : [];
    const recipes = recipesRes.status === 'fulfilled' ? recipesRes.value.data.data || [] : [];
    const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.data || [] : [];
    const ingredients = ingredientsRes.status === 'fulfilled' ? ingredientsRes.value.data.data || [] : [];
    const tags = tagsRes.status === 'fulfilled' ? tagsRes.value.data.data || [] : [];
    return {
      totalUsers: users.length,
      totalRecipes: recipes.length,
      totalCategories: categories.length,
      totalIngredients: ingredients.length,
      totalTags: tags.length,
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

  getAllCategories: async () => {
    const res = await api.get('/IngredientLabel');
    return res.data.data || [];
  },

  createCategory: async (data) => {
    const res = await api.post('/IngredientLabel', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/IngredientLabel/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/IngredientLabel/${id}`);
    return res.data;
  },

  // Ingredient Tag operations
  getAllIngredientTags: async () => {
    const res = await api.get('/IngredientTag');
    return res.data.data || [];
  },

  createIngredientTag: async (data) => {
    const res = await api.post('/IngredientTag', data);
    return res.data;
  },

  updateIngredientTag: async (id, data) => {
    const res = await api.put(`/IngredientTag/${id}`, data);
    return res.data;
  },

  deleteIngredientTag: async (id) => {
    const res = await api.delete(`/IngredientTag/${id}`);
    return res.data;
  },

  // Ingredient operations
  getAllIngredients: async () => {
    const res = await api.get('/Ingredient');
    return res.data.data || [];
  },

  createIngredient: async (data) => {
    const res = await api.post('/Ingredient', data);
    return res.data;
  },

  updateIngredient: async (id, data) => {
    const res = await api.put(`/Ingredient/${id}`, data);
    return res.data;
  },

  deleteIngredient: async (id) => {
    const res = await api.delete(`/Ingredient/${id}`);
    return res.data;
  },

  // Nutritional Value operations
  getAllNutritionalValues: async () => {
    const res = await api.get('/NutritionalValue');
    return res.data.data || [];
  },

  createNutritionalValue: async (data) => {
    const res = await api.post('/NutritionalValue', data);
    return res.data;
  },

  updateNutritionalValue: async (id, data) => {
    const res = await api.put(`/NutritionalValue/${id}`, data);
    return res.data;
  },

  deleteNutritionalValue: async (id) => {
    const res = await api.delete(`/NutritionalValue/${id}`);
    return res.data;
  },

  // Recipe Tag operations
  getAllRecipeTags: async () => {
    const res = await api.get('/RecipeTag');
    return res.data.data || [];
  },

  createRecipeTag: async (data) => {
    const res = await api.post('/RecipeTag', data);
    return res.data;
  },

  updateRecipeTag: async (id, data) => {
    const res = await api.put(`/RecipeTag/${id}`, data);
    return res.data;
  },

  deleteRecipeTag: async (id) => {
    const res = await api.delete(`/RecipeTag/${id}`);
    return res.data;
  },

  // Recipe operations
  getAllRecipes: async () => {
    const res = await api.get('/Recipe');
    return res.data.data || [];
  },

  createRecipe: async (data) => {
    const res = await api.post('/Recipe', data);
    return res.data;
  },

  updateRecipe: async (id, data) => {
    const res = await api.put(`/Recipe/${id}`, data);
    return res.data;
  },

  deleteRecipe: async (id) => {
    const res = await api.delete(`/Recipe/${id}`);
    return res.data;
  },

  // Recipe Label operations
  getAllRecipeLabels: async () => {
    const res = await api.get('/RecipeLabel');
    return res.data.data || [];
  },

  createRecipeLabel: async (data) => {
    const res = await api.post('/RecipeLabel', data);
    return res.data;
  },

  updateRecipeLabel: async (id, data) => {
    const res = await api.put(`/RecipeLabel/${id}`, data);
    return res.data;
  },

  deleteRecipeLabel: async (id) => {
    const res = await api.delete(`/RecipeLabel/${id}`);
    return res.data;
  },

  // Recipe Ingredient operations
  getAllRecipeIngredients: async () => {
    const res = await api.get('/RecipeIngredient');
    return res.data.data || [];
  },

  createRecipeIngredient: async (data) => {
    const res = await api.post('/RecipeIngredient', data);
    return res.data;
  },

  updateRecipeIngredient: async (id, data) => {
    const res = await api.put(`/RecipeIngredient/${id}`, data);
    return res.data;
  },

  deleteRecipeIngredient: async (id) => {
    const res = await api.delete(`/RecipeIngredient/${id}`);
    return res.data;
  },

  // Plan operations
  getAllPlans: async () => {
    const res = await api.get('/Plan');
    return res.data.data || [];
  },

  createPlan: async (data) => {
    const res = await api.post('/Plan', data);
    return res.data;
  },

  updatePlan: async (id, data) => {
    const res = await api.put(`/Plan/${id}`, data);
    return res.data;
  },

  deletePlan: async (id) => {
    const res = await api.delete(`/Plan/${id}`);
    return res.data;
  },

  // Statistics
  getSubscriptionStatistics: async (startDate, endDate) => {
    let url = '/Statistic/subscriptions';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    const res = await api.get(url);
    return res.data.data;
  },
};
