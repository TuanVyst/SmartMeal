import api from './api';
import { addOptimisticNutritionLog, removeOptimisticNutritionLog } from './nutritionLogService';

export async function addDiaryEntry(entry) {
  const { data } = await api.post('/nutrition-diary', entry);
  const entryData = data?.entry;
  const accountId = entryData?.account_id || entryData?.accountId;
  if (accountId && entryData) {
    const entryToCache = {
      ...entryData,
      recipe: entryData.recipe || (entryData.recipe_id && entry?.recipeName ? {
        recipe_id: entryData.recipe_id,
        recipe_name: entry.recipeName,
      } : undefined),
    };
    addOptimisticNutritionLog(accountId, entryToCache);
  }
  return data;
}

export async function getDiaryByDate(date) {
  const { data } = await api.get(`/nutrition-diary?date=${date}`);
  return data;
}

export async function deleteDiaryEntry(entryId, accountId = null) {
  const { data } = await api.delete(`/nutrition-diary/${entryId}`);
  if (accountId) {
    removeOptimisticNutritionLog(accountId, entryId);
  }
  return data;
}

export async function getDiarySummary(startDate, endDate) {
  const { data } = await api.get(`/nutrition-diary/summary?start=${startDate}&end=${endDate}`);
  return data;
}

export const nutritionDiaryService = {
  addDiaryEntry,
  getDiaryByDate,
  deleteDiaryEntry,
  getDiarySummary,
};