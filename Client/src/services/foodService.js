import api from './api';
import { recipeService, invalidateRecipesCache } from './recipeService';

const ING_CACHE_KEY = 'smartmeal_ingredients_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
let memoryIngredients = null;
let memoryIngredientsTs = 0;
let inflightIngredientsPromise = null;

export const invalidateIngredientsCache = () => {
  memoryIngredients = null;
  memoryIngredientsTs = 0;
  inflightIngredientsPromise = null;
  try {
    sessionStorage.removeItem(ING_CACHE_KEY);
  } catch {
    // ignore storage errors
  }
  invalidateRecipesCache();
};

export const getCachedIngredientsSync = () => {
  if (memoryIngredients && Date.now() - memoryIngredientsTs < CACHE_TTL_MS) {
    return memoryIngredients;
  }
  try {
    const raw = sessionStorage.getItem(ING_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.ts || 0) < CACHE_TTL_MS) {
        memoryIngredients = parsed.data;
        memoryIngredientsTs = parsed.ts;
        return memoryIngredients;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

const setCachedIngredients = (list) => {
  if (!Array.isArray(list)) return;
  memoryIngredients = list;
  memoryIngredientsTs = Date.now();
  try {
    sessionStorage.setItem(
      ING_CACHE_KEY,
      JSON.stringify({ data: list, ts: memoryIngredientsTs })
    );
  } catch {
    // ignore quota errors
  }
};

export const getIngredients = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getCachedIngredientsSync();
    if (cached) {
      return { data: { success: true, data: cached } };
    }
    if (inflightIngredientsPromise) {
      return inflightIngredientsPromise;
    }
  }
  inflightIngredientsPromise = api
    .get('/ingredient')
    .then((res) => {
      const list = res?.data?.data || [];
      setCachedIngredients(list);
      return res;
    })
    .finally(() => {
      inflightIngredientsPromise = null;
    });
  return inflightIngredientsPromise;
};

export const getIngredientById = (id) => api.get(`/ingredient/${id}`);

export const createIngredient = async (data) => {
  const res = await api.post('/ingredient', data);
  invalidateIngredientsCache();
  return res;
};

export const updateIngredient = async (id, data) => {
  const res = await api.put(`/ingredient/${id}`, data);
  invalidateIngredientsCache();
  return res;
};

export const deleteIngredient = async (id) => {
  const res = await api.delete(`/ingredient/${id}`);
  invalidateIngredientsCache();
  return res;
};

export const getIngredientTags = () => api.get('/ingredientTag');

export const getRecipes = () => recipeService.getAll();
