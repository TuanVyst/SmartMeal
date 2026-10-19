import { createContext, useState, useEffect, useCallback } from 'react';
import { getLockedIngredientsForProfile, calculateDailyTargets, HEALTH_CONDITION_RULES, GOAL_RULES } from '../utils/healthRules';
import { calculateHealthScore } from '../utils/healthScoreEngine';
import { healthSurveyService } from '../services/healthSurveyService';
import { useAuth } from './AuthContext';

export const HealthProfileContext = createContext(null);

export function HealthProfileProvider({ children }) {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [lockedIngredients, setLockedIngredients] = useState([]);
  const [reducedIngredients, setReducedIngredients] = useState([]);
  const [preferredIngredients, setPreferredIngredients] = useState([]);
  const [dailyCalorieBudget, setDailyCalorieBudget] = useState(2000);
  const [dailyTargets, setDailyTargets] = useState({
    calories: 2000, protein: 75, carbs: 250, fat: 65,
    fiber: 25, sugarLimit: 50, saltLimit: 5,
  });
  // Phase 1 — survey preference fields
  const [planCycleDays, setPlanCycleDays] = useState(7);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dietType, setDietType] = useState('omnivore');
  const [loading, setLoading] = useState(true);
  const currentUserId = user?.accountId || user?.account_id || null;
  const [profileLoadedForUser, setProfileLoadedForUser] = useState(null);
  const isProfileLoading = loading || (Boolean(currentUserId) && profileLoadedForUser !== currentUserId);

  const computeDerivedState = useCallback((profile) => {
    if (!profile) {
      setLockedIngredients([]);
      setReducedIngredients([]);
      setPreferredIngredients([]);
      setDailyCalorieBudget(2000);
      setDailyTargets({
        calories: 2000, protein: 75, carbs: 250, fat: 65,
        fiber: 25, sugarLimit: 50, saltLimit: 5,
      });
      return;
    }

    const conditions = profile.conditions || [];
    const goal = profile.goal;
    const locked = getLockedIngredientsForProfile(conditions, goal);
    setLockedIngredients(locked);

    const reducedSet = new Set();
    conditions.forEach(condition => {
      const rules = HEALTH_CONDITION_RULES[condition];
      if (rules && rules.reducedIngredients) {
        rules.reducedIngredients.forEach(ing => reducedSet.add(ing));
      }
    });
    if (goal && GOAL_RULES[goal] && GOAL_RULES[goal].reducedIngredients) {
      GOAL_RULES[goal].reducedIngredients.forEach(ing => reducedSet.add(ing));
    }
    setReducedIngredients(Array.from(reducedSet));

    const preferredSet = new Set();
    conditions.forEach(condition => {
      const rules = HEALTH_CONDITION_RULES[condition];
      if (rules && rules.preferredIngredients) {
        rules.preferredIngredients.forEach(ing => preferredSet.add(ing));
      }
    });
    if (goal && GOAL_RULES[goal] && GOAL_RULES[goal].preferredIngredients) {
      GOAL_RULES[goal].preferredIngredients.forEach(ing => preferredSet.add(ing));
    }
    setPreferredIngredients(Array.from(preferredSet));

    const budget = profile.dailyTargets || calculateDailyTargets(profile);
    setDailyCalorieBudget(budget.calories);
    setDailyTargets(budget);

    // Sync Phase 1 preference fields
    setPlanCycleDays(profile.planCycleDays || 7);
    setMealsPerDay(profile.mealsPerDay || 3);
    setDietType(profile.dietType || 'omnivore');
  }, []);

  useEffect(() => {
    if (!user) {
      setHealthProfile(null);
      setSurveyCompleted(false);
      localStorage.removeItem('userHealthProfile');
      localStorage.removeItem('healthSurveyCompleted');
      computeDerivedState(null);
      setProfileLoadedForUser(null);
      setLoading(false);
      return;
    }
    const currentAccId = user.accountId || user.account_id;
    const isAdmin = (user.role || '').toLowerCase() === 'admin';
    if (isAdmin) {
      setHealthProfile(null);
      setSurveyCompleted(true);
      computeDerivedState(null);
      setProfileLoadedForUser(currentAccId);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchProfile = async () => {
      try {
        const { success, profile } = await healthSurveyService.getHealthProfile();
        if (success && profile) {
          setHealthProfile(profile);
          setSurveyCompleted(true);
          computeDerivedState(profile);
          localStorage.setItem('userHealthProfile', JSON.stringify(profile));
          localStorage.setItem('healthSurveyCompleted', 'true');
          if (currentAccId) {
            localStorage.setItem(`hasSeenHealthReport_${currentAccId}`, 'true');
          }
        } else {
          localStorage.removeItem('userHealthProfile');
          localStorage.removeItem('healthSurveyCompleted');
          setHealthProfile(null);
          setSurveyCompleted(false);
          computeDerivedState(null);
        }
      } catch (e) {
        const isNotFound = e.status === 404 || e.response?.status === 404;
        if (isNotFound) {
          localStorage.removeItem('userHealthProfile');
          localStorage.removeItem('healthSurveyCompleted');
          setHealthProfile(null);
          setSurveyCompleted(false);
          computeDerivedState(null);
        } else {
          // Lỗi mạng / server → fallback về localStorage chỉ khi profile hợp lệ
          const storedProfile = localStorage.getItem('userHealthProfile');
          const completed = localStorage.getItem('healthSurveyCompleted') === 'true';

          if (storedProfile && completed) {
            try {
              const profile = JSON.parse(storedProfile);
              if (profile) {
                setHealthProfile(profile);
                setSurveyCompleted(true);
                computeDerivedState(profile);
                if (currentAccId) {
                  localStorage.setItem(`hasSeenHealthReport_${currentAccId}`, 'true');
                }
              } else {
                setHealthProfile(null);
                setSurveyCompleted(false);
                computeDerivedState(null);
              }
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
        }
      } finally {
        setProfileLoadedForUser(currentAccId);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, computeDerivedState]);

  const completeSurvey = useCallback(async (profileData) => {
    const isAdmin = (user?.role || '').toLowerCase() === 'admin';
    if (isAdmin) {
      return { success: false, message: 'Tài khoản quản trị viên không sử dụng khảo sát sức khỏe.' };
    }

    const result = profileData
      ? await healthSurveyService.submitHealthSurvey(profileData)
      : { success: true };

    if (result.success) {
      if (result.profile) {
        setHealthProfile(result.profile);
        computeDerivedState(result.profile);
      }
      setSurveyCompleted(true);
      const accId = user?.accountId || user?.account_id;
      if (accId) setProfileLoadedForUser(accId);
      localStorage.setItem('healthSurveyCompleted', 'true');
    }
    return result;
  }, [computeDerivedState, user]);

  const updateProfile = useCallback(async (data) => {
    const isAdmin = (user?.role || '').toLowerCase() === 'admin';
    if (isAdmin) {
      return { success: false, message: 'Tài khoản quản trị viên không sử dụng khảo sát sức khỏe.' };
    }

    const result = await healthSurveyService.updateHealthProfile(data);
    if (result.success && result.profile) {
      setHealthProfile(result.profile);
      computeDerivedState(result.profile);
    }
    return result;
  }, [computeDerivedState]);

  /**
   * Tính Health Score (0-100) cho một recipe.
   * Dùng engine mới từ healthScoreEngine.js.
   */
  const getHealthScoreForRecipe = useCallback((recipe) => {
    const result = calculateHealthScore(recipe, healthProfile, dailyCalorieBudget);
    return result.score;
  }, [healthProfile, dailyCalorieBudget]);

  /**
   * Tính chi tiết Health Score: score + reasons + badge + allergyBlock.
   * Dùng cho warning popup khi thêm vào nhật ký.
   */
  const getHealthScoreDetails = useCallback((recipe) => {
    return calculateHealthScore(recipe, healthProfile, dailyCalorieBudget);
  }, [healthProfile, dailyCalorieBudget]);

  return (
    <HealthProfileContext.Provider value={{
      healthProfile,
      surveyCompleted,
      lockedIngredients,
      reducedIngredients,
      preferredIngredients,
      dailyCalorieBudget,
      dailyTargets,
      planCycleDays,
      mealsPerDay,
      dietType,
      loading: isProfileLoading,
      completeSurvey,
      updateProfile,
      getHealthScoreForRecipe,
      getHealthScoreDetails,
    }}>
      {children}
    </HealthProfileContext.Provider>
  );
}