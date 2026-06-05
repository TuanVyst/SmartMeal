import api from './api';

export const getIngredients = () => api.get('/ingredient');

export const getIngredientById = (id) => api.get(`/ingredient/${id}`);

export const createIngredient = (data) => api.post('/ingredient', data);

export const updateIngredient = (id, data) => api.put(`/ingredient/${id}`, data);

export const deleteIngredient = (id) => api.delete(`/ingredient/${id}`);
