import { createContext, useState, useEffect, useCallback } from 'react';
import { getLockedIngredientsForProfile, calculateDailyTargets, HEALTH_CONDITION_RULES } from '../utils/healthRules';
import { healthSurveyService } from '../services/healthSurveyService';
import { useAuth } from './AuthContext';

export const HealthProfileContext = createContext(null);

export function HealthProfileProvider({ children }) {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [lockedIngredients, setLockedIngredients] = useState([]);
  const [reducedIngredients, setReducedIngredients] = useState([]);
  const [dailyCalorieBudget, setDailyCalorieBudget] = useState(2000);
  const [dailyTargets, setDailyTargets] = useState({
    calories: 2000, protein: 75, carbs: 250, fat: 65,
    fiber: 25, sugarLimit: 50, saltLimit: 5,
  });
  const [loading, setLoading] = useState(true);

  const computeDerivedState = useCallback((profile) => {
    if (!profile) {
      setLockedIngredients([]);
      setReducedIngredients([]);
      setDailyCalorieBudget(2000);
      setDailyTargets({
        calories: 2000, protein: 75, carbs: 250, fat: 65,
        fiber: 25, sugarLimit: 50, saltLimit: 5,
      });
      return;
    }

    const conditions = profile.conditions || [];
    const locked = getLockedIngredientsForProfile(conditions);
    setLockedIngredients(locked);

    const reducedSet = new Set();
    conditions.forEach(condition => {
      const rules = HEALTH_CONDITION_RULES[condition];
      if (rules && rules.reducedIngredients) {
        rules.reducedIngredients.forEach(ing => reducedSet.add(ing));
      }
    });
    setReducedIngredients(Array.from(reducedSet));

    const bmiLevel = profile.bmiLevel || 'normal';
    const goal = profile.goal || 'maintain';
    const budget = calculateDailyTargets(bmiLevel, goal, conditions);
    setDailyCalorieBudget(budget.calories);
    setDailyTargets(budget);
  }, []);

  useEffect(() => {
    if (!user) {
      setHealthProfile(null);
      setSurveyCompleted(false);
      localStorage.removeItem('userHealthProfile');
      localStorage.removeItem('healthSurveyCompleted');
      computeDerivedState(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { success, profile } = await healthSurveyService.getHealthProfile();
        if (success && profile) {
          setHealthProfile(profile);
          setSurveyCompleted(true);
          computeDerivedState(profile);
          localStorage.setItem('userHealthProfile', JSON.stringify(profile));
          localStorage.setItem('healthSurveyCompleted', 'true');
        }
      } catch (e) {
        // Fallback to local storage if API fails or 404 (No profile)
        const storedProfile = localStorage.getItem('userHealthProfile');
        const completed = localStorage.getItem('healthSurveyCompleted') === 'true';

        if (storedProfile && completed) {
          try {
            const profile = JSON.parse(storedProfile);
            setHealthProfile(profile);
            setSurveyCompleted(true);
            computeDerivedState(profile);
          } catch (err) {
            setHealthProfile(null);
            setSurveyCompleted(false);
            computeDerivedState(null);
          }
        } else {
          setHealthProfile(null);
          setSurveyCompleted(false);
          computeDerivedState(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, computeDerivedState]);

  const completeSurvey = useCallback(async (profileData) => {
    const result = profileData
      ? await healthSurveyService.submitHealthSurvey(profileData)
      : { success: true };

    if (result.success) {
      if (result.profile) {
        setHealthProfile(result.profile);
        computeDerivedState(result.profile);
      }
      setSurveyCompleted(true);
      localStorage.setItem('healthSurveyCompleted', 'true');
    }
    return result;
  }, [computeDerivedState]);

  const updateProfile = useCallback(async (data) => {
    const result = await healthSurveyService.updateHealthProfile(data);
    if (result.success && result.profile) {
      setHealthProfile(result.profile);
      computeDerivedState(result.profile);
    }
    return result;
  }, [computeDerivedState]);

  const getHealthScoreForRecipe = useCallback((recipe) => {
    if (!healthProfile) return 100;

    let score = 100;

    const recipeIngredients = recipe.ingredients?.map(i => i.name?.toLowerCase()) || [];
    const lockedLower = lockedIngredients.map(i => i.toLowerCase());

    lockedLower.forEach(locked => {
      const hasLocked = recipeIngredients.some(ri => ri.includes(locked));
      if (hasLocked) score -= 30;
    });

    const mealCalorieLimit = dailyCalorieBudget / 3;
    const recipeCalories = recipe.nutrition?.calories || recipe.calories || 0;
    if (recipeCalories > mealCalorieLimit) {
      const excessRatio = (recipeCalories - mealCalorieLimit) / mealCalorieLimit;
      score -= Math.min(40, Math.round(excessRatio * 40));
    }

    return Math.max(0, score);
  }, [healthProfile, lockedIngredients, dailyCalorieBudget]);

  return (
    <HealthProfileContext.Provider value={{
      healthProfile,
      surveyCompleted,
      lockedIngredients,
      reducedIngredients,
      dailyCalorieBudget,
      dailyTargets,
      loading,
      completeSurvey,
      updateProfile,
      getHealthScoreForRecipe
    }}>
      {children}
    </HealthProfileContext.Provider>
  );
}