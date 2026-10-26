import api from './api';

const RECIPE_CACHE_KEY = 'smartmeal_recipes_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
let memoryRecipes = null;
let memoryRecipesTs = 0;
let inflightRecipesPromise = null;

export const invalidateRecipesCache = () => {
  memoryRecipes = null;
  memoryRecipesTs = 0;
  inflightRecipesPromise = null;
  try {
    sessionStorage.removeItem(RECIPE_CACHE_KEY);
  } catch {
    // ignore storage errors
  }
};

export const getCachedRecipesSync = () => {
  if (memoryRecipes && Date.now() - memoryRecipesTs < CACHE_TTL_MS) {
    return memoryRecipes;
  }
  try {
    const raw = sessionStorage.getItem(RECIPE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.ts || 0) < CACHE_TTL_MS) {
        memoryRecipes = parsed.data;
        memoryRecipesTs = parsed.ts;
        return memoryRecipes;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

const setCachedRecipes = (list) => {
  if (!Array.isArray(list)) return;
  memoryRecipes = list;
  memoryRecipesTs = Date.now();
  try {
    sessionStorage.setItem(
      RECIPE_CACHE_KEY,
      JSON.stringify({ data: list, ts: memoryRecipesTs })
    );
  } catch {
    // ignore quota errors
  }
};

export const recipeService = {
  getAll: async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedRecipesSync();
      if (cached) {
        return { data: { success: true, data: cached } };
      }
      if (inflightRecipesPromise) {
        return inflightRecipesPromise;
      }
    }
    inflightRecipesPromise = api
      .get('/recipe')
      .then((res) => {
        const list = res?.data?.data || [];
        setCachedRecipes(list);
        return res;
      })
      .finally(() => {
        inflightRecipesPromise = null;
      });
    return inflightRecipesPromise;
  },
  getById: (id) => api.get(`/recipe/${id}`),
  create: async (data) => {
    const res = await api.post('/recipe', data);
    invalidateRecipesCache();
    return res;
  },
  update: async (id, data) => {
    const res = await api.put(`/recipe/${id}`, data);
    invalidateRecipesCache();
    return res;
  },
  delete: async (id) => {
    const res = await api.delete(`/recipe/${id}`);
    invalidateRecipesCache();
    return res;
  },
  getByIngredients: (ingredientIds) => {
    const qs = ingredientIds.map((id) => `ingredientIds=${id}`).join('&');
    return api.get(`/recipe/ingredients?${qs}`);
  },
  suggestFromPantry: (accountId) => api.get(`/recipe/suggest/pantry/${accountId}`),
  suggestByDetectedIngredients: (ingredients) =>
    api.post('/recipe/suggest/detected-ingredients', { ingredients }),
  getTags: () => api.get('/RecipeTag'),
  suggestByCalories: (targetCalories, tolerancePercent = 20) =>
    api.get(`/recipe/suggest-by-calories?targetCalories=${targetCalories}&tolerancePercent=${tolerancePercent}`),
};
