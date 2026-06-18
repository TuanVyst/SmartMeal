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
};
