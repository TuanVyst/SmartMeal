import api from './api';

const LOGS_CACHE_PREFIX = 'smartmeal_nutrition_logs_';
const CACHE_TTL_MS = 5 * 60 * 1000;

// In-memory cache keyed by accountId
const memoryLogsMap = new Map();
const inflightPromises = new Map();

export const getCachedNutritionLogsSync = (accountId) => {
  if (!accountId) return null;
  const inMem = memoryLogsMap.get(accountId);
  if (inMem && Date.now() - inMem.ts < CACHE_TTL_MS) {
    return inMem.data;
  }
  try {
    const raw = sessionStorage.getItem(`${LOGS_CACHE_PREFIX}${accountId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.ts || 0) < CACHE_TTL_MS) {
        memoryLogsMap.set(accountId, { data: parsed.data, ts: parsed.ts });
        return parsed.data;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const setCachedNutritionLogs = (accountId, logs) => {
  if (!accountId || !Array.isArray(logs)) return;
  const ts = Date.now();
  memoryLogsMap.set(accountId, { data: logs, ts });
  try {
    sessionStorage.setItem(
      `${LOGS_CACHE_PREFIX}${accountId}`,
      JSON.stringify({ data: logs, ts })
    );
  } catch {
    // ignore quota errors
  }
};

export const addOptimisticNutritionLog = (accountId, log) => {
  if (!accountId || !log) return;
  const existing = getCachedNutritionLogsSync(accountId) || [];
  const logId = log.id || log.log_id || log.nutrition_log_id;
  const filtered = existing.filter(l => (l.id || l.log_id || l.nutrition_log_id) !== logId);
  const updated = [log, ...filtered];
  setCachedNutritionLogs(accountId, updated);
};

export const removeOptimisticNutritionLog = (accountId, logId) => {
  if (!accountId || !logId) return;
  const existing = getCachedNutritionLogsSync(accountId) || [];
  const updated = existing.filter(l => (l.id || l.log_id || l.nutrition_log_id) !== logId);
  setCachedNutritionLogs(accountId, updated);
};

export const invalidateNutritionLogsCache = (accountId) => {
  if (accountId) {
    memoryLogsMap.delete(accountId);
    try {
      sessionStorage.removeItem(`${LOGS_CACHE_PREFIX}${accountId}`);
    } catch {
      // ignore
    }
  } else {
    memoryLogsMap.clear();
  }
};

export const nutritionLogService = {
  getAll: async (accountId, forceRefresh = false) => {
    if (!accountId) return { data: { success: true, data: [] } };
    if (!forceRefresh) {
      const cached = getCachedNutritionLogsSync(accountId);
      if (cached) {
        return { data: { success: true, data: cached } };
      }
      if (inflightPromises.has(accountId)) {
        return inflightPromises.get(accountId);
      }
    }

    const promise = api.get(`/nutritionlog?accountId=${accountId}`)
      .then((res) => {
        const list = res?.data?.data || [];
        setCachedNutritionLogs(accountId, list);
        return res;
      })
      .finally(() => {
        inflightPromises.delete(accountId);
      });

    inflightPromises.set(accountId, promise);
    return promise;
  },

  getById: (id) => api.get(`/nutritionlog/${id}`),

  create: async (data) => {
    const res = await api.post('/nutritionlog', data);
    const created = res?.data?.data;
    if (data.account_id && created) {
      addOptimisticNutritionLog(data.account_id, created);
    }
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/nutritionlog/${id}`, data);
    const updated = res?.data?.data;
    if (data.account_id && updated) {
      addOptimisticNutritionLog(data.account_id, updated);
    }
    return res;
  },

  delete: async (id, accountId = null) => {
    const res = await api.delete(`/nutritionlog/${id}`);
    if (accountId) {
      removeOptimisticNutritionLog(accountId, id);
    }
    return res;
  },
};
