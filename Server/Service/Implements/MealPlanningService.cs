using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Helpers;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class MealPlanningService : IMealPlanningService
    {
        private readonly IMealPlanRepository _mealPlanRepo;
        private readonly IRecipeRepo _recipeRepo;
        private readonly INutritionGoalRepo _nutritionGoalRepo;
        private readonly IHealthProfileRepo _healthProfileRepo;
        private readonly IPantryRepo _pantryRepo;
        private readonly INutritionLogService _nutritionLogService;
        private readonly ISubscriptionService _subscriptionService;

        public MealPlanningService(
            IMealPlanRepository mealPlanRepo,
            IRecipeRepo recipeRepo,
            INutritionGoalRepo nutritionGoalRepo,
            IHealthProfileRepo healthProfileRepo,
            IPantryRepo pantryRepo,
            INutritionLogService nutritionLogService,
            ISubscriptionService subscriptionService)
        {
            _mealPlanRepo = mealPlanRepo;
            _recipeRepo = recipeRepo;
            _nutritionGoalRepo = nutritionGoalRepo;
            _healthProfileRepo = healthProfileRepo;
            _pantryRepo = pantryRepo;
            _nutritionLogService = nutritionLogService;
            _subscriptionService = subscriptionService;
        }

        public async Task<MealPlanResponseDto> GeneratePlanPreviewAsync(Guid accountId, int days = 7)
        {
            if (!await _subscriptionService.HasFeatureAsync(accountId, "meal_plan"))
                throw new UnauthorizedAccessException("Chức năng tạo thực đơn chỉ dành cho tài khoản Pro. Vui lòng nâng cấp gói để sử dụng.");

            // 1. Get Nutrition Goal & Profile
            var goal = await _nutritionGoalRepo.GetNutritionGoalByAccountId(accountId);
            var profile = await _healthProfileRepo.GetHealthProfileByAccountId(accountId);
            if (goal == null || profile == null)
            {
                throw new Exception("Vui lòng hoàn thành bài khảo sát sức khỏe trước khi tạo thực đơn.");
            }

            // Collect dates that already have meals
            var allPlans = await _mealPlanRepo.GetAllPlansByAccountId(accountId);
            var existingDates = new HashSet<DateTime>();
            foreach (var p in allPlans)
            {
                if (p.Days == null) continue;
                foreach (var d in p.Days)
                {
                    if (d.Entries != null && d.Entries.Any())
                    {
                        existingDates.Add(d.DayDate.Date);
                    }
                }
            }

            // 2. Meal distribution (Default 3 meals: Breakfast 25%, Lunch 40%, Dinner 35%)
            double targetCalories = goal.TargetCalories ?? 0;
            double breakfastCal = targetCalories * 0.25;
            double lunchCal = targetCalories * 0.40;
            double dinnerCal = targetCalories * 0.35;

            // 3. Get all recipes
            var allRecipes = await _recipeRepo.GetAllRecipes();
            var validRecipes = allRecipes.Where(r => !r.IsDeleted && r.RecipeIngredients != null && r.RecipeIngredients.Any()).ToList();

            var plan = new MealPlan
            {
                MealPlan_id = Guid.NewGuid(),
                Account_id = accountId,
                Status = "preview",
                StartDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(days - 1), DateTimeKind.Utc),
                TotalDays = days,
                Days = new List<MealPlanDay>()
            };

            var usedRecipeIds = new HashSet<Guid>();
            var random = new Random();
            int dayIndex = 0;

            for (int i = 1; i <= days; i++)
            {
                var dayDate = plan.StartDate.Value.AddDays(i - 1);

                // Skip dates that already have meals
                if (existingDates.Contains(dayDate.Date))
                    continue;

                dayIndex++;
                var day = new MealPlanDay
                {
                    Day_id = Guid.NewGuid(),
                    MealPlan_id = plan.MealPlan_id,
                    DayIndex = dayIndex,
                    DayDate = dayDate,
                    Entries = new List<MealPlanEntry>()
                };

                // Breakfast
                var bRecipe = SelectBestRecipe(validRecipes, breakfastCal, profile, usedRecipeIds, random);
                if (bRecipe != null)
                {
                    day.Entries.Add(CreateEntry(day.Day_id, bRecipe, "breakfast", 1));
                    usedRecipeIds.Add(bRecipe.Recipe_id);
                }

                // Lunch
                var lRecipe = SelectBestRecipe(validRecipes, lunchCal, profile, usedRecipeIds, random);
                if (lRecipe != null)
                {
                    day.Entries.Add(CreateEntry(day.Day_id, lRecipe, "lunch", 2));
                    usedRecipeIds.Add(lRecipe.Recipe_id);
                }

                // Dinner
                var dRecipe = SelectBestRecipe(validRecipes, dinnerCal, profile, usedRecipeIds, random);
                if (dRecipe != null)
                {
                    day.Entries.Add(CreateEntry(day.Day_id, dRecipe, "dinner", 3));
                    usedRecipeIds.Add(dRecipe.Recipe_id);
                }

                plan.Days.Add(day);
            }

            if (plan.Days.Count == 0)
            {
                throw new Exception("Tất cả các ngày trong khoảng đã có thực đơn.");
            }

            plan.TotalDays = plan.Days.Count;
            if (plan.Days.Any())
            {
                plan.StartDate = plan.Days.Min(d => d.DayDate);
                plan.EndDate = plan.Days.Max(d => d.DayDate);
            }

            // 4. Save Preview Plan
            await _mealPlanRepo.AddPlan(plan);

            // 5. Build DTO
            return await BuildPlanDto(plan, accountId);
        }

        public async Task<MealPlanResponseDto> ConfirmPlanAsync(Guid planId)
        {
            var plan = await _mealPlanRepo.GetPlanById(planId);
            if (plan == null) throw new Exception("Không tìm thấy thực đơn.");

            plan.Status = "active";
            await _mealPlanRepo.UpdatePlan(plan);

            return await BuildPlanDto(plan, plan.Account_id);
        }

        public async Task<MealPlanResponseDto> GetActivePlanAsync(Guid accountId)
        {
            var plan = await _mealPlanRepo.GetActivePlanByAccountId(accountId);
            if (plan == null) return null;
            return await BuildPlanDto(plan, accountId);
        }

        public async Task<MealPlanResponseDto> SuggestNextDayAsync(Guid accountId)
        {
            if (!await _subscriptionService.HasFeatureAsync(accountId, "meal_plan"))
                throw new UnauthorizedAccessException("Chức năng gợi ý thực đơn chỉ dành cho tài khoản Pro. Vui lòng nâng cấp gói để sử dụng.");

            // Find existing active plan and add a new day to it
            var existingPlan = await _mealPlanRepo.GetActivePlanByAccountId(accountId);
            if (existingPlan == null)
                throw new Exception("Chưa có thực đơn nào được chốt. Vui lòng tạo thực đơn trước.");

            var goal = await _nutritionGoalRepo.GetNutritionGoalByAccountId(accountId);
            var profile = await _healthProfileRepo.GetHealthProfileByAccountId(accountId);
            if (goal == null || profile == null)
                throw new Exception("Vui lòng hoàn thành bài khảo sát sức khỏe trước.");

            var allRecipes = await _recipeRepo.GetAllRecipes();
            var validRecipes = allRecipes.Where(r => !r.IsDeleted && r.RecipeIngredients != null && r.RecipeIngredients.Any()).ToList();

            double targetCalories = goal.TargetCalories ?? 0;
            double breakfastCal = targetCalories * 0.25;
            double lunchCal = targetCalories * 0.40;
            double dinnerCal = targetCalories * 0.35;

            // Determine next day index and date
            int nextDayIndex = (existingPlan.Days?.Max(d => d.DayIndex) ?? 0) + 1;
            DateTime nextDayDate = DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(nextDayIndex - 1), DateTimeKind.Utc);

            // Collect already used recipe ids
            var usedRecipeIds = new HashSet<Guid>();
            if (existingPlan.Days != null)
                foreach (var existingDay in existingPlan.Days)
                    if (existingDay.Entries != null)
                        foreach (var e in existingDay.Entries)
                            usedRecipeIds.Add(e.Recipe_id);

            var random = new Random();
            var newDay = new MealPlanDay
            {
                Day_id = Guid.NewGuid(),
                MealPlan_id = existingPlan.MealPlan_id,
                DayIndex = nextDayIndex,
                DayDate = nextDayDate,
                Entries = new List<MealPlanEntry>()
            };

            // Breakfast
            var bRecipe = SelectBestRecipe(validRecipes, breakfastCal, profile, usedRecipeIds, random);
            if (bRecipe != null)
            {
                newDay.Entries.Add(CreateEntry(newDay.Day_id, bRecipe, "breakfast", 1));
                usedRecipeIds.Add(bRecipe.Recipe_id);
            }

            // Lunch
            var lRecipe = SelectBestRecipe(validRecipes, lunchCal, profile, usedRecipeIds, random);
            if (lRecipe != null)
            {
                newDay.Entries.Add(CreateEntry(newDay.Day_id, lRecipe, "lunch", 2));
                usedRecipeIds.Add(lRecipe.Recipe_id);
            }

            // Dinner
            var dRecipe = SelectBestRecipe(validRecipes, dinnerCal, profile, usedRecipeIds, random);
            if (dRecipe != null)
            {
                newDay.Entries.Add(CreateEntry(newDay.Day_id, dRecipe, "dinner", 3));
                usedRecipeIds.Add(dRecipe.Recipe_id);
            }

            existingPlan.Days.Add(newDay);
            existingPlan.TotalDays = nextDayIndex;
            existingPlan.EndDate = nextDayDate;
            await _mealPlanRepo.UpdatePlan(existingPlan);

            return await BuildPlanDto(existingPlan, accountId);
        }

        public async Task<MealPlanResponseDto> SwapRecipeAsync(Guid planId, Guid entryId, Guid newRecipeId)
        {
            var plan = await _mealPlanRepo.GetPlanById(planId);
            if (plan == null) throw new Exception("Không tìm thấy thực đơn.");

            var entry = await _mealPlanRepo.GetEntryById(entryId);
            if (entry == null || entry.MealPlanDay.MealPlan_id != planId) throw new Exception("Entry không hợp lệ.");

            var newRecipe = await _recipeRepo.GetRecipeById(newRecipeId);
            if (newRecipe == null) throw new Exception("Món ăn không tồn tại.");

            // Basic check if new recipe is somewhat close to the slot's calorie budget.
            // Normally we'd do strict validation, but allowing user freedom is fine, we can return a warning.
            // For now, just update.
            var (calories, protein, carbs, fat, fiber) = CalculateRecipeNutrition(newRecipe);
            
            entry.Recipe_id = newRecipe.Recipe_id;
            entry.SlotCalories = calories;
            entry.SlotProtein = protein;
            entry.SlotCarbs = carbs;
            entry.SlotFat = fat;
            entry.SlotFiber = fiber;
            // update macros if needed
            await _mealPlanRepo.UpdateEntry(entry);

            // Fetch the updated plan to return fresh DTO
            var updatedPlan = await _mealPlanRepo.GetPlanById(planId);
            return await BuildPlanDto(updatedPlan, updatedPlan.Account_id);
        }

        public async Task<MealPlanResponseDto> RemoveEntryAsync(Guid planId, Guid entryId)
        {
            var plan = await _mealPlanRepo.GetPlanById(planId);
            if (plan == null) throw new Exception("Không tìm thấy thực đơn.");

            var entry = await _mealPlanRepo.GetEntryById(entryId);
            if (entry == null || entry.MealPlanDay.MealPlan_id != planId) throw new Exception("Entry không hợp lệ.");

            await _mealPlanRepo.RemoveEntry(entry);

            // Check if day is empty, if so we could remove the day, but leaving it empty is also fine or we can delete it.
            // For now, let's just return the updated plan.
            var updatedPlan = await _mealPlanRepo.GetPlanById(planId);
            return await BuildPlanDto(updatedPlan, updatedPlan.Account_id);
        }

        private Recipe SelectBestRecipe(List<Recipe> recipes, double targetCalories, HealthProfile profile, HashSet<Guid> usedIds, Random rnd)
        {
            // Hard limit: reject recipes exceeding target by more than 10%
            double maxAllowed = targetCalories * 1.10;

            var scoredRecipes = recipes.Select(r =>
            {
                double calories = CalculateRecipeNutrition(r).calories;

                // Reject recipes that exceed the calorie limit
                if (calories > maxAllowed)
                    return new { Recipe = r, Score = -1000.0 };

                double score = 100 - (Math.Abs(calories - targetCalories) / targetCalories * 100);

                if (usedIds.Contains(r.Recipe_id))
                {
                    score -= 30; // Variety penalty
                }

                if (profile.DietType == "Vegetarian" || profile.DietType == "Ăn chay")
                {
                    bool isMeat = r.RecipeLabels != null && r.RecipeLabels.Any(l => l.RecipeTag.Type == "meat" || l.RecipeTag.Type == "seafood");
                    if (isMeat) score -= 1000;
                }

                return new { Recipe = r, Score = score };
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ToList();

            if (!scoredRecipes.Any()) return recipes.OrderBy(x => rnd.Next()).FirstOrDefault();

            // Tie-break top 3
            var top3 = scoredRecipes.Take(3).ToList();
            return top3[rnd.Next(top3.Count)].Recipe;
        }

        private (double calories, double protein, double carbs, double fat, double fiber) CalculateRecipeNutrition(Recipe recipe)
        {
            if (recipe.RecipeIngredients == null || recipe.Servings <= 0) return (0, 0, 0, 0, 0);
            double totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;
            foreach (var ri in recipe.RecipeIngredients)
            {
                if (ri.Ingredient?.Nutritional_value != null)
                {
                    var multiplier = UnitConverter.GetMultiplier(
                        ri.Quantity,
                        ri.UOM,
                        ri.Ingredient.Nutritional_value.ServingSize ?? 100.0,
                        ri.Ingredient.Nutritional_value.ServingUnit,
                        ri.Ingredient.Name,
                        ri.Ingredient.Nutritional_value.EverydayWeight
                    );
                    if (multiplier <= 0) multiplier = 1.0;
                    totalCal += ri.Ingredient.Nutritional_value.Calories * multiplier;
                    totalPro += (ri.Ingredient.Nutritional_value.Protein ?? 0) * multiplier;
                    totalCarb += (ri.Ingredient.Nutritional_value.Carbs ?? 0) * multiplier;
                    totalFat += (ri.Ingredient.Nutritional_value.Fat ?? 0) * multiplier;
                    totalFib += (ri.Ingredient.Nutritional_value.Fiber ?? 0) * multiplier;
                }
            }
            double div = recipe.Servings;
            return (totalCal / div, totalPro / div, totalCarb / div, totalFat / div, totalFib / div);
        }

        private MealPlanEntry CreateEntry(Guid dayId, Recipe recipe, string slot, int order)
        {
            var (calories, protein, carbs, fat, fiber) = CalculateRecipeNutrition(recipe);
            return new MealPlanEntry
            {
                Entry_id = Guid.NewGuid(),
                Day_id = dayId,
                Recipe_id = recipe.Recipe_id,
                MealSlot = slot,
                SlotCalories = calories,
                SlotProtein = protein,
                SlotCarbs = carbs,
                SlotFat = fat,
                SlotFiber = fiber,
                SortOrder = order
            };
        }

        private async Task<MealPlanResponseDto> BuildPlanDto(MealPlan plan, Guid accountId)
        {
            var userPantry = await _pantryRepo.GetPantryByAccountId(accountId);
            var pantryIngredients = userPantry.Select(p => p.Ingredient_id).ToHashSet();

            var loggedEntries = new List<NutritionLog>();
            if (plan.StartDate.HasValue && plan.EndDate.HasValue)
            {
                loggedEntries = await _nutritionLogService.GetNutritionLogsByAccountAndDateRange(accountId, plan.StartDate.Value, plan.EndDate.Value);
            }

            var reqIngredients = new Dictionary<Guid, RequiredIngredientDto>();

            var dto = new MealPlanResponseDto
            {
                MealPlan_id = plan.MealPlan_id,
                Status = plan.Status,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                TotalDays = plan.TotalDays,
                GeneratedAt = plan.GeneratedAt,
                Days = plan.Days.OrderBy(d => d.DayIndex).Select(d =>
                {
                    double dayCal = 0;
                    var entries = d.Entries.OrderBy(e => e.SortOrder).Select(e =>
                    {
                        dayCal += e.SlotCalories;

                        // Add ingredients
                        if (e.Recipe != null && e.Recipe.RecipeIngredients != null)
                        {
                            foreach (var ri in e.Recipe.RecipeIngredients)
                            {
                                if (ri.Ingredient != null)
                                {
                                    if (!reqIngredients.ContainsKey(ri.Ingredient_id))
                                    {
                                        reqIngredients[ri.Ingredient_id] = new RequiredIngredientDto
                                        {
                                            Ingredient_id = ri.Ingredient_id,
                                            Name = ri.Ingredient.Name,
                                            ImageUrl = ri.Ingredient.ImageUrl,
                                            Quantity = 0,
                                            Uom = ri.UOM,
                                            IsPossessed = pantryIngredients.Contains(ri.Ingredient_id)
                                        };
                                    }
                                    reqIngredients[ri.Ingredient_id].Quantity += ri.Quantity;
                                }
                            }
                        }

                        bool isLogged = loggedEntries.Any(log =>
                            !log.IsDeleted &&
                            log.LogDate.Date == d.DayDate.Date &&
                            log.MealType != null &&
                            log.MealType.Equals(e.MealSlot, StringComparison.OrdinalIgnoreCase) &&
                            log.Recipe_id == e.Recipe_id);

                        return new MealPlanEntryResponseDto
                        {
                            Entry_id = e.Entry_id,
                            Recipe_id = e.Recipe_id,
                            RecipeName = e.Recipe?.Recipe_name ?? "Unknown",
                            RecipeImage = e.Recipe?.Recipe_name, // client resolve this
                            MealSlot = e.MealSlot,
                            SlotCalories = Math.Round(e.SlotCalories),
                            SlotProtein = Math.Round(e.SlotProtein),
                            SlotCarbs = Math.Round(e.SlotCarbs),
                            SlotFat = Math.Round(e.SlotFat),
                            SlotFiber = Math.Round(e.SlotFiber),
                            CookTime = e.Recipe?.CookTime ?? 0,
                            Difficulty = e.Recipe?.Difficulty ?? "easy",
                            IsLogged = isLogged
                        };
                    }).ToList();

                    return new MealPlanDayResponseDto
                    {
                        Day_id = d.Day_id,
                        DayIndex = d.DayIndex,
                        DayDate = d.DayDate,
                        Entries = entries,
                        TotalCalories = Math.Round(dayCal)
                    };
                }).ToList(),
                RequiredIngredients = reqIngredients.Values.ToList()
            };

            return dto;
        }

        public async Task<List<MealPlanResponseDto>> GetAllPlansAsync(Guid accountId)
        {
            var plans = await _mealPlanRepo.GetAllPlansByAccountId(accountId);
            var result = new List<MealPlanResponseDto>();
            foreach (var plan in plans)
            {
                result.Add(await BuildPlanDto(plan, accountId));
            }
            return result;
        }

        public async Task<Dictionary<string, bool>> CheckDateMealsAsync(Guid accountId, DateTime date)
        {
            var dateOnly = date.Date;
            var plans = await _mealPlanRepo.GetAllPlansByAccountId(accountId);
            
            var result = new Dictionary<string, bool>
            {
                { "breakfast", false },
                { "lunch", false },
                { "dinner", false },
                { "hasAllMeals", false }
            };

            foreach (var plan in plans)
            {
                if (plan.Days == null) continue;
                var day = plan.Days.FirstOrDefault(d => d.DayDate.Date == dateOnly);
                if (day?.Entries == null) continue;

                foreach (var entry in day.Entries)
                {
                    if (entry.MealSlot == "breakfast") result["breakfast"] = true;
                    else if (entry.MealSlot == "lunch") result["lunch"] = true;
                    else if (entry.MealSlot == "dinner") result["dinner"] = true;
                }
            }

            result["hasAllMeals"] = result["breakfast"] && result["lunch"] && result["dinner"];
            return result;
        }

        public async Task<MealPlanResponseDto> SuggestForDateAsync(Guid accountId, DateTime targetDate, List<string> meals = null)
        {
            if (!await _subscriptionService.HasFeatureAsync(accountId, "meal_plan"))
                throw new UnauthorizedAccessException("Chức năng tạo gợi ý nhanh chỉ dành cho tài khoản Pro. Vui lòng nâng cấp gói để sử dụng.");

            var selectedMealsForCheck = meals?.Select(m => m.ToLower()).ToHashSet() ?? new HashSet<string> { "breakfast", "lunch", "dinner" };
            
            // Check if date already has any meals
            var dateCheck = await CheckDateMealsAsync(accountId, targetDate);
            
            bool hasAllRequested = true;
            foreach (var m in selectedMealsForCheck)
            {
                if (dateCheck.ContainsKey(m) && !dateCheck[m])
                {
                    hasAllRequested = false;
                    break;
                }
            }
            
            if (hasAllRequested)
            {
                throw new Exception("Ngày này đã có đầy đủ các bữa ăn bạn yêu cầu.");
            }

            var goal = await _nutritionGoalRepo.GetNutritionGoalByAccountId(accountId);
            var profile = await _healthProfileRepo.GetHealthProfileByAccountId(accountId);
            if (goal == null || profile == null)
            {
                throw new Exception("Vui lòng hoàn thành bài khảo sát sức khỏe trước.");
            }

            var allRecipes = await _recipeRepo.GetAllRecipes();
            var validRecipes = allRecipes.Where(r => !r.IsDeleted && r.RecipeIngredients != null && r.RecipeIngredients.Any()).ToList();

            double targetCalories = goal.TargetCalories ?? 0;
            double breakfastCal = targetCalories * 0.25;
            double lunchCal = targetCalories * 0.40;
            double dinnerCal = targetCalories * 0.35;

            // Find or create a plan for this date range
            var existingPlan = await _mealPlanRepo.GetActivePlanByAccountId(accountId);
            
            // Collect already used recipe ids for this date
            var usedRecipeIds = new HashSet<Guid>();
            if (existingPlan?.Days != null)
            {
                foreach (var d in existingPlan.Days)
                {
                    if (d.Entries != null)
                    {
                        foreach (var e in d.Entries)
                        {
                            usedRecipeIds.Add(e.Recipe_id);
                        }
                    }
                }
            }

            var random = new Random();
            var dateOnly = targetDate.Date;
            
            // Check if there's already a day for this date in the existing plan
            MealPlanDay existingDay = null;
            if (existingPlan?.Days != null)
            {
                existingDay = existingPlan.Days.FirstOrDefault(d => d.DayDate.Date == dateOnly);
            }

            bool isNewPlan = false;
            if (existingDay == null)
            {
                // Create new day
                int nextDayIndex = (existingPlan?.Days?.Max(d => d.DayIndex) ?? 0) + 1;
                DateTime dayDate = DateTime.SpecifyKind(dateOnly, DateTimeKind.Utc);

                existingDay = new MealPlanDay
                {
                    Day_id = Guid.NewGuid(),
                    MealPlan_id = existingPlan?.MealPlan_id ?? Guid.NewGuid(),
                    DayIndex = nextDayIndex,
                    DayDate = dayDate,
                    Entries = new List<MealPlanEntry>()
                };

                if (existingPlan == null)
                {
                    // Create a new plan
                    isNewPlan = true;
                    existingPlan = new MealPlan
                    {
                        MealPlan_id = existingDay.MealPlan_id,
                        Account_id = accountId,
                        Status = "active",
                        StartDate = dayDate,
                        EndDate = dayDate,
                        TotalDays = 1,
                        Days = new List<MealPlanDay> { existingDay }
                    };
                }
                else
                {
                    existingPlan.Days.Add(existingDay);
                }
            }

            // Add missing meals
            var selectedMeals = meals?.Select(m => m.ToLower()).ToHashSet() ?? new HashSet<string> { "breakfast", "lunch", "dinner" };
            var existingSlots = existingDay.Entries?.Select(e => e.MealSlot).ToHashSet() ?? new HashSet<string>();

            if (selectedMeals.Contains("breakfast") && !existingSlots.Contains("breakfast"))
            {
                var bRecipe = SelectBestRecipe(validRecipes, breakfastCal, profile, usedRecipeIds, random);
                if (bRecipe != null)
                {
                    var entry = CreateEntry(existingDay.Day_id, bRecipe, "breakfast", 1);
                    existingDay.Entries.Add(entry);
                    usedRecipeIds.Add(bRecipe.Recipe_id);
                }
            }

            if (selectedMeals.Contains("lunch") && !existingSlots.Contains("lunch"))
            {
                var lRecipe = SelectBestRecipe(validRecipes, lunchCal, profile, usedRecipeIds, random);
                if (lRecipe != null)
                {
                    var entry = CreateEntry(existingDay.Day_id, lRecipe, "lunch", 2);
                    existingDay.Entries.Add(entry);
                    usedRecipeIds.Add(lRecipe.Recipe_id);
                }
            }

            if (selectedMeals.Contains("dinner") && !existingSlots.Contains("dinner"))
            {
                var dRecipe = SelectBestRecipe(validRecipes, dinnerCal, profile, usedRecipeIds, random);
                if (dRecipe != null)
                {
                    var entry = CreateEntry(existingDay.Day_id, dRecipe, "dinner", 3);
                    existingDay.Entries.Add(entry);
                    usedRecipeIds.Add(dRecipe.Recipe_id);
                }
            }

            // Save once after all meals are added
            if (isNewPlan)
            {
                await _mealPlanRepo.AddPlan(existingPlan);
            }
            else
            {
                var newTotalDays = existingPlan.Days.Count;
                var newEndDate = existingPlan.Days.Max(d => d.DayDate);
                
                bool needsUpdate = false;
                if (existingPlan.TotalDays != newTotalDays)
                {
                    existingPlan.TotalDays = newTotalDays;
                    needsUpdate = true;
                }
                if (existingPlan.EndDate != newEndDate)
                {
                    existingPlan.EndDate = newEndDate;
                    needsUpdate = true;
                }
                
                if (needsUpdate)
                {
                    await _mealPlanRepo.UpdatePlan(existingPlan);
                }
                else
                {
                    // Just save the new entries
                    await _mealPlanRepo.UpdatePlan(existingPlan); // which just calls SaveChangesAsync
                }
            }

            return await BuildPlanDto(existingPlan, accountId);
        }
    }
}
