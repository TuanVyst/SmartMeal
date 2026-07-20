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

        public MealPlanningService(
            IMealPlanRepository mealPlanRepo,
            IRecipeRepo recipeRepo,
            INutritionGoalRepo nutritionGoalRepo,
            IHealthProfileRepo healthProfileRepo,
            IPantryRepo pantryRepo,
            INutritionLogService nutritionLogService)
        {
            _mealPlanRepo = mealPlanRepo;
            _recipeRepo = recipeRepo;
            _nutritionGoalRepo = nutritionGoalRepo;
            _healthProfileRepo = healthProfileRepo;
            _pantryRepo = pantryRepo;
            _nutritionLogService = nutritionLogService;
        }

        public async Task<MealPlanResponseDto> GeneratePlanPreviewAsync(Guid accountId, int days = 7)
        {
            // 1. Get Nutrition Goal & Profile
            var goal = await _nutritionGoalRepo.GetNutritionGoalByAccountId(accountId);
            var profile = await _healthProfileRepo.GetHealthProfileByAccountId(accountId);
            if (goal == null || profile == null)
            {
                throw new Exception("Vui lòng hoàn thành bài khảo sát sức khỏe trước khi tạo thực đơn.");
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

            for (int i = 1; i <= days; i++)
            {
                var dayDate = plan.StartDate.Value.AddDays(i - 1);
                var day = new MealPlanDay
                {
                    Day_id = Guid.NewGuid(),
                    MealPlan_id = plan.MealPlan_id,
                    DayIndex = i,
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

            // Auto-save meal plan entries to nutrition diary
            if (plan.Days != null)
            {
                foreach (var day in plan.Days)
                {
                    if (day.Entries == null) continue;
                    foreach (var entry in day.Entries)
                    {
                        var recipe = await _recipeRepo.GetRecipeById(entry.Recipe_id);
                        var nut = recipe != null ? CalculateRecipeNutrition(recipe) : (0, 0, 0, 0, 0);
                        var logRequest = new NutritionLogRequest
                        {
                            Account_id = plan.Account_id,
                            LogDate = day.DayDate,
                            MealType = entry.MealSlot,
                            Recipe_id = entry.Recipe_id,
                            Quantity = 1,
                            Unit = "phần",
                            TotalCalories = nut.calories,
                            TotalProtein = nut.protein,
                            TotalCarbs = nut.carbs,
                            TotalFat = nut.fat,
                            TotalFiber = nut.fiber
                        };
                        await _nutritionLogService.CreateNutritionLog(logRequest);
                    }
                }
            }

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

            // Auto-save to nutrition diary (consistent with ConfirmPlanAsync pattern)
            foreach (var entry in newDay.Entries)
            {
                var recipe = await _recipeRepo.GetRecipeById(entry.Recipe_id);
                var nut = recipe != null ? CalculateRecipeNutrition(recipe) : (0, 0, 0, 0, 0);
                var logRequest = new NutritionLogRequest
                {
                    Account_id = accountId,
                    LogDate = newDay.DayDate,
                    MealType = entry.MealSlot,
                    Recipe_id = entry.Recipe_id,
                    Quantity = 1,
                    Unit = "phần",
                    TotalCalories = nut.calories,
                    TotalProtein = nut.protein,
                    TotalCarbs = nut.carbs,
                    TotalFat = nut.fat,
                    TotalFiber = nut.fiber
                };
                await _nutritionLogService.CreateNutritionLog(logRequest);
            }

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

                        return new MealPlanEntryResponseDto
                        {
                            Entry_id = e.Entry_id,
                            Recipe_id = e.Recipe_id,
                            RecipeName = e.Recipe?.Recipe_name ?? "Unknown",
                            RecipeImage = e.Recipe?.Recipe_name, // client resolve this
                            MealSlot = e.MealSlot,
                            SlotCalories = Math.Round(e.SlotCalories),
                            CookTime = e.Recipe?.CookTime ?? 0,
                            Difficulty = e.Recipe?.Difficulty ?? "easy"
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
    }
}
