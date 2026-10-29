import api from './api';

const ALLERGY_CACHE_PREFIX = 'smartmeal_allergies_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000;

// In-memory cache keyed by accountId
const memoryAllergiesMap = new Map();
const inflightPromises = new Map();

export const invalidateAllergiesCache = (accountId) => {
  if (accountId) {
    memoryAllergiesMap.delete(accountId);
    try {
      sessionStorage.removeItem(`${ALLERGY_CACHE_PREFIX}${accountId}`);
    } catch {
      // ignore storage errors
    }
  } else {
    memoryAllergiesMap.clear();
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(ALLERGY_CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // ignore storage errors
    }
  }
};

export const getCachedAllergiesSync = (accountId) => {
  if (!accountId) return null;
  const memoryEntry = memoryAllergiesMap.get(accountId);
  if (memoryEntry && Date.now() - memoryEntry.ts < CACHE_TTL_MS) {
    return memoryEntry.data;
  }
  try {
    const raw = sessionStorage.getItem(`${ALLERGY_CACHE_PREFIX}${accountId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.ts || 0) < CACHE_TTL_MS) {
        memoryAllergiesMap.set(accountId, { data: parsed.data, ts: parsed.ts });
        return parsed.data;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

export const setCachedAllergies = (accountId, list) => {
  if (!accountId || !Array.isArray(list)) return;
  const ts = Date.now();
  memoryAllergiesMap.set(accountId, { data: list, ts });
  try {
    sessionStorage.setItem(
      `${ALLERGY_CACHE_PREFIX}${accountId}`,
      JSON.stringify({ data: list, ts })
    );
  } catch {
    // ignore quota errors
  }
};

export const allergyService = {
  getAll: async (accountId, forceRefresh = false) => {
    if (!accountId) {
      return api.get('/allergy');
    }
    if (!forceRefresh) {
      const cached = getCachedAllergiesSync(accountId);
      if (cached) {
        return { data: { success: true, data: cached } };
      }
      if (inflightPromises.has(accountId)) {
        return inflightPromises.get(accountId);
      }
    }

    const promise = (async () => {
      try {
        const res = await api.get(`/allergy?accountId=${accountId}`);
        const items = res.data?.data;
        if (Array.isArray(items)) {
          setCachedAllergies(accountId, items);
        }
        return res;
      } finally {
        inflightPromises.delete(accountId);
      }
    })();

    inflightPromises.set(accountId, promise);
    return promise;
  },

  getById: (id) => api.get(`/allergy/${id}`),

  create: async (data) => {
    const res = await api.post('/allergy', data);
    const createdItem = res.data?.data;
    if (data.account_id && createdItem) {
      const current = getCachedAllergiesSync(data.account_id) || [];
      const updated = current.some(a => a.ingredient_id === createdItem.ingredient_id)
        ? current.map(a => a.ingredient_id === createdItem.ingredient_id ? createdItem : a)
        : [...current, createdItem];
      setCachedAllergies(data.account_id, updated);
    } else if (data.account_id) {
      invalidateAllergiesCache(data.account_id);
    }
    return res;
  },

  update: (id, data) => {
    if (data.account_id) invalidateAllergiesCache(data.account_id);
    return api.put(`/allergy/${id}`, data);
  },

  delete: async (id, accountId, ingredientId) => {
    const res = await api.delete(`/allergy/${id}`);
    if (accountId) {
      const current = getCachedAllergiesSync(accountId) || [];
      const updated = current.filter(a => a.allergy_id !== id && (ingredientId ? a.ingredient_id !== ingredientId : true));
      setCachedAllergies(accountId, updated);
    }
    return res;
  },
};