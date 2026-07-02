import { useState, useEffect, useCallback } from 'react';
import { nutritionDiaryService } from '../services/nutritionDiaryService';
import { getTodayDateKey } from '../utils/dateTime';

export function useNutritionDiary(initialDate = null) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate || getTodayDateKey());

  const fetchEntries = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nutritionDiaryService.getDiaryByDate(date);
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message || 'Không thể tải nhật ký dinh dưỡng');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(selectedDate);
  }, [selectedDate, fetchEntries]);

  const totalMacros = {
    calories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
    carbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
    protein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
    fat: entries.reduce((sum, e) => sum + (e.fat || 0), 0),
    sugar: entries.reduce((sum, e) => sum + (e.sugar || 0), 0),
    sodium: entries.reduce((sum, e) => sum + (e.sodium || 0), 0),
  };

  const addEntry = useCallback(async (entry) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nutritionDiaryService.addDiaryEntry({
        ...entry,
        date: selectedDate,
      });
      setEntries(prev => [...prev, data.entry || data]);
      return data;
    } catch (err) {
      setError(err.message || 'Không thể thêm mục');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const deleteEntry = useCallback(async (entryId) => {
    setLoading(true);
    setError(null);
    try {
      await nutritionDiaryService.deleteDiaryEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      setError(err.message || 'Không thể xóa mục');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    totalMacros,
    selectedDate,
    setSelectedDate,
    addEntry,
    deleteEntry,
    refetch: () => fetchEntries(selectedDate),
  };
}