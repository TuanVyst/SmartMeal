using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Service.Implements
{
    public class NutritionLogService : INutritionLogService
    {
        private readonly INutritionLogRepo _nutritionLogRepo;
        private readonly IIngredientRepo _ingredientRepo;
        private readonly IRecipeIngredientRepo _recipeIngredientRepo;
        private readonly IRecipeRepo _recipeRepo;

        public NutritionLogService(
            INutritionLogRepo nutritionLogRepo, 
            IIngredientRepo ingredientRepo,
            IRecipeIngredientRepo recipeIngredientRepo,
            IRecipeRepo recipeRepo)
        {
            _nutritionLogRepo = nutritionLogRepo;
            _ingredientRepo = ingredientRepo;
            _recipeIngredientRepo = recipeIngredientRepo;
            _recipeRepo = recipeRepo;
        }

        public async Task<List<NutritionLog>> GetAllNutritionLogs()
        {
            return await _nutritionLogRepo.GetAllNutritionLogs();
        }

        public async Task<List<NutritionLog>> GetNutritionLogsByAccountAndDate(Guid accountId, DateTime date)
        {
            return await _nutritionLogRepo.GetNutritionLogsByAccountAndDate(accountId, date);
        }

        public async Task<List<NutritionLog>> GetNutritionLogsByAccountAndDateRange(Guid accountId, DateTime startDate, DateTime endDate)
        {
            return await _nutritionLogRepo.GetNutritionLogsByAccountAndDateRange(accountId, startDate, endDate);
        }

        public async Task<NutritionLog> GetNutritionLogById(Guid id)
        {
            return await _nutritionLogRepo.GetNutritionLogById(id);
        }

        public async Task<NutritionLog> CreateNutritionLog(NutritionLogRequest request)
        {
            var entity = new NutritionLog
            {
                Log_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                LogDate = request.LogDate == default ? DateTime.UtcNow : request.LogDate,
                MealType = request.MealType,
                Recipe_id = request.Recipe_id,
                Ingredient_id = request.Ingredient_id,
                Quantity = request.Quantity,
                Unit = request.Unit,
                TotalCalories = request.TotalCalories,
                TotalProtein = request.TotalProtein,
                TotalCarbs = request.TotalCarbs,
                TotalFat = request.TotalFat,
                TotalFiber = request.TotalFiber,
                TotalSugar = request.TotalSugar,
                TotalSalt = request.TotalSalt,
                TotalCholesterol = request.TotalCholesterol,
                IsDeleted = false
            };

            await CalculateNutritionTotals(entity);

            return await _nutritionLogRepo.CreateNutritionLog(entity);
        }

        public async Task<NutritionLog> UpdateNutritionLog(Guid id, NutritionLogRequest request)
        {
            var entity = await _nutritionLogRepo.GetNutritionLogById(id);

            if (entity == null)
                throw new Exception("NutritionLog not found");

            entity.Account_id = request.Account_id;
            entity.LogDate = request.LogDate == default ? DateTime.UtcNow : request.LogDate;
            entity.MealType = request.MealType;
            entity.Recipe_id = request.Recipe_id;
            entity.Ingredient_id = request.Ingredient_id;
            entity.Quantity = request.Quantity;
            entity.Unit = request.Unit;
            entity.TotalCalories = request.TotalCalories;
            entity.TotalProtein = request.TotalProtein;
            entity.TotalCarbs = request.TotalCarbs;
            entity.TotalFat = request.TotalFat;
            entity.TotalFiber = request.TotalFiber;
            entity.TotalSugar = request.TotalSugar;
            entity.TotalSalt = request.TotalSalt;
            entity.TotalCholesterol = request.TotalCholesterol;

            await CalculateNutritionTotals(entity);

            return await _nutritionLogRepo.UpdateNutritionLog(entity);
        }

        public async Task<NutritionLog> SoftDeleteNutritionLog(Guid id)
        {
            return await _nutritionLogRepo.SoftDeleteNutritionLog(id);
        }

        private async Task CalculateNutritionTotals(NutritionLog entity)
        {
            if (entity.TotalCalories == null || entity.TotalCalories == 0)
            {
                if (entity.Ingredient_id.HasValue)
                {
                    var ingredient = await _ingredientRepo.GetIngredientById(entity.Ingredient_id.Value);

                    if (ingredient?.Nutritional_value != null)
                    {
                        var multiplier = (entity.Quantity ?? 100.0) / (ingredient.Nutritional_value.ServingSize ?? 100.0);
                        if (multiplier <= 0) multiplier = 1.0;

                        entity.TotalCalories = ingredient.Nutritional_value.Calories * multiplier;
                        entity.TotalProtein = (ingredient.Nutritional_value.Protein ?? 0) * multiplier;
                        entity.TotalCarbs = (ingredient.Nutritional_value.Carbs ?? 0) * multiplier;
                        entity.TotalFat = (ingredient.Nutritional_value.Fat ?? 0) * multiplier;
                        entity.TotalFiber = (ingredient.Nutritional_value.Fiber ?? 0) * multiplier;
                        entity.TotalSugar = (ingredient.Nutritional_value.Sugar ?? 0) * multiplier;
                        entity.TotalSalt = (ingredient.Nutritional_value.Salt ?? 0) * multiplier;
                        entity.TotalCholesterol = (ingredient.Nutritional_value.Cholesterol ?? 0) * multiplier;
                    }
                }
                else if (entity.Recipe_id.HasValue)
                {
                    var recipeIngredients = await _recipeIngredientRepo.GetRecipeIngredientsByRecipeId(entity.Recipe_id.Value);
                    var recipe = await _recipeRepo.GetRecipeById(entity.Recipe_id.Value);
                    double servings = recipe?.Servings ?? 1.0;
                    if (servings <= 0) servings = 1.0;

                    double totalCal = 0;
                    double totalPro = 0;
                    double totalCarb = 0;
                    double totalFat = 0;
                    double totalFib = 0;
                    double totalSug = 0;
                    double totalSod = 0;
                    double totalChol = 0;

                    foreach (var ri in recipeIngredients)
                    {
                        if (ri.Ingredient?.Nutritional_value != null)
                        {
                            var multiplier = (ri.Quantity) / (ri.Ingredient.Nutritional_value.ServingSize ?? 100.0);
                            if (multiplier <= 0) multiplier = 1.0;

                            totalCal += ri.Ingredient.Nutritional_value.Calories * multiplier;
                            totalPro += (ri.Ingredient.Nutritional_value.Protein ?? 0) * multiplier;
                            totalCarb += (ri.Ingredient.Nutritional_value.Carbs ?? 0) * multiplier;
                            totalFat += (ri.Ingredient.Nutritional_value.Fat ?? 0) * multiplier;
                            totalFib += (ri.Ingredient.Nutritional_value.Fiber ?? 0) * multiplier;
                            totalSug += (ri.Ingredient.Nutritional_value.Sugar ?? 0) * multiplier;
                            totalSod += (ri.Ingredient.Nutritional_value.Salt ?? 0) * multiplier;
                            totalChol += (ri.Ingredient.Nutritional_value.Cholesterol ?? 0) * multiplier;
                        }
                    }

                    // Divide by Servings to get nutrition per 1 serving/portion
                    totalCal /= servings;
                    totalPro /= servings;
                    totalCarb /= servings;
                    totalFat /= servings;
                    totalFib /= servings;
                    totalSug /= servings;
                    totalSod /= servings;
                    totalChol /= servings;

                    var portion = entity.Quantity ?? 1.0;
                    entity.TotalCalories = totalCal * portion;
                    entity.TotalProtein = totalPro * portion;
                    entity.TotalCarbs = totalCarb * portion;
                    entity.TotalFat = totalFat * portion;
                    entity.TotalFiber = totalFib * portion;
                    entity.TotalSugar = totalSug * portion;
                    entity.TotalSalt = totalSod * portion;
                    entity.TotalCholesterol = totalChol * portion;
                }
            }
        }
    }
}
