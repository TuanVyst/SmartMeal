import api from './api';

const GOALS_CACHE_PREFIX = 'smartmeal_nutrition_goals_';
const CACHE_TTL_MS = 10 * 60 * 1000;

const memoryGoalsMap = new Map();
const inflightPromises = new Map();

export const getCachedNutritionGoalsSync = (accountId) => {
  if (!accountId) return null;
  const inMem = memoryGoalsMap.get(accountId);
  if (inMem && Date.now() - inMem.ts < CACHE_TTL_MS) {
    return inMem.data;
  }
  try {
    const raw = sessionStorage.getItem(`${GOALS_CACHE_PREFIX}${accountId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.ts || 0) < CACHE_TTL_MS) {
        memoryGoalsMap.set(accountId, { data: parsed.data, ts: parsed.ts });
        return parsed.data;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const setCachedNutritionGoals = (accountId, goals) => {
  if (!accountId || !Array.isArray(goals)) return;
  const ts = Date.now();
  memoryGoalsMap.set(accountId, { data: goals, ts });
  try {
    sessionStorage.setItem(
      `${GOALS_CACHE_PREFIX}${accountId}`,
      JSON.stringify({ data: goals, ts })
    );
  } catch {
    // ignore quota errors
  }
};

export const invalidateNutritionGoalsCache = (accountId) => {
  if (accountId) {
    memoryGoalsMap.delete(accountId);
    try {
      sessionStorage.removeItem(`${GOALS_CACHE_PREFIX}${accountId}`);
    } catch {
      // ignore
    }
  } else {
    memoryGoalsMap.clear();
  }
};

export const nutritionGoalService = {
  getAll: async (accountId, forceRefresh = false) => {
    if (!accountId) return { data: { success: true, data: [] } };
    if (!forceRefresh) {
      const cached = getCachedNutritionGoalsSync(accountId);
      if (cached) {
        return { data: { success: true, data: cached } };
      }
      if (inflightPromises.has(accountId)) {
        return inflightPromises.get(accountId);
      }
    }

    const promise = api.get(`/nutritiongoal?accountId=${accountId}`)
      .then((res) => {
        const list = res?.data?.data || [];
        setCachedNutritionGoals(accountId, list);
        return res;
      })
      .finally(() => {
        inflightPromises.delete(accountId);
      });

    inflightPromises.set(accountId, promise);
    return promise;
  },

  getById: (id) => api.get(`/nutritiongoal/${id}`),

  create: async (data) => {
    const res = await api.post('/nutritiongoal', data);
    if (data.account_id) {
      invalidateNutritionGoalsCache(data.account_id);
    }
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/nutritiongoal/${id}`, data);
    if (data.account_id) {
      invalidateNutritionGoalsCache(data.account_id);
    }
    return res;
  },

  delete: async (id, accountId = null) => {
    const res = await api.delete(`/nutritiongoal/${id}`);
    if (accountId) {
      invalidateNutritionGoalsCache(accountId);
    }
    return res;
  },
};
