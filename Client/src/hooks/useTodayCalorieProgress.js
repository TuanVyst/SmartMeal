import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthProfile } from './useHealthProfile';
import { nutritionLogService } from '../services/nutritionLogService';
import { getTodayDateKey, toDateKey } from '../utils/dateTime';
import { NUTRITION_UPDATED_EVENT } from '../utils/nutritionEvents';

export function useTodayCalorieProgress() {
  const { user } = useAuth();
  const { dailyTargets } = useHealthProfile();
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const accountId = user?.accountId || user?.account_id;
  const targetCalories = dailyTargets?.calories || 2000;

  const fetchTodayCalories = useCallback(async () => {
    if (!accountId) {
      setCaloriesToday(0);
      setLoading(false);
      return;
    }

    try {
      const res = await nutritionLogService.getAll(accountId);
      const logs = res.data?.data || [];
      const todayKey = getTodayDateKey();
      const total = logs
        .filter((log) => toDateKey(log.logDate) === todayKey)
        .reduce((sum, log) => sum + (log.totalCalories || 0), 0);
      setCaloriesToday(total);
    } catch (error) {
      console.error('Không thể tải calories hôm nay:', error);
      setCaloriesToday(0);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchTodayCalories();
  }, [fetchTodayCalories]);

  // Debounced server sync: waits for activity to settle before refetching.
  // This ensures:
  //   1. Delta/local update is applied immediately → CSS animation starts
  //   2. Server has time to commit the change
  //   3. Only then we fetch the authoritative total — no race condition
  const debounceRef = useRef(null);
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTodayCalories();
    }, 1500);
  }, [fetchTodayCalories]);

  useEffect(() => {
    const handleUpdate = (event) => {
      const { deltaCalories, caloriesToday: override } = event.detail || {};

      // Immediate local update for responsive feedback
      if (typeof override === 'number') {
        setCaloriesToday(override);
      } else if (typeof deltaCalories === 'number' && deltaCalories !== 0) {
        setCaloriesToday((prev) => Math.max(0, prev + deltaCalories));
      }

      // Schedule a debounced server sync (gives server time to commit)
      debouncedFetch();
    };

    window.addEventListener(NUTRITION_UPDATED_EVENT, handleUpdate);
    window.addEventListener('focus', () => fetchTodayCalories());

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchTodayCalories();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener(NUTRITION_UPDATED_EVENT, handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchTodayCalories, debouncedFetch]);

  const progress = targetCalories > 0
    ? Math.min(caloriesToday / targetCalories, 1)
    : 0;

  return {
    caloriesToday: Math.round(caloriesToday),
    targetCalories,
    progress,
    loading,
    refetch: fetchTodayCalories,
  };
}
