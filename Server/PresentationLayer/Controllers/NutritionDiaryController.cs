using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/nutrition-diary")]
    [Authorize]
    public class NutritionDiaryController : ControllerBase
    {
        private readonly INutritionLogService _nutritionLogService;

        public NutritionDiaryController(INutritionLogService nutritionLogService)
        {
            _nutritionLogService = nutritionLogService;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.Parse(claim.Value);
        }

        [HttpPost]
        public async Task<IActionResult> AddEntry([FromBody] DiaryEntryRequest request)
        {
            try
            {
                var accountId = GetAccountId();

                var logRequest = new NutritionLogRequest
                {
                    Account_id = accountId,
                    LogDate = request.Date ?? DateTime.UtcNow,
                    MealType = request.MealType,
                    Recipe_id = request.RecipeId,
                    Quantity = request.Servings,
                    TotalCalories = request.Calories,
                    TotalProtein = request.Protein,
                    TotalCarbs = request.Carbs,
                    TotalFat = request.Fat,
                    Unit = "servings",
                };

                var entry = await _nutritionLogService.CreateNutritionLog(logRequest);

                return Ok(new { success = true, entry });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetByDate([FromQuery] DateTime? date)
        {
            try
            {
                var accountId = GetAccountId();
                var queryDate = date ?? DateTime.UtcNow;
                var entries = await _nutritionLogService.GetNutritionLogsByAccountAndDate(accountId, queryDate);

                var totalCalories = entries.Sum(e => e.TotalCalories ?? 0);
                var totalCarbs = entries.Sum(e => e.TotalCarbs ?? 0);
                var totalProtein = entries.Sum(e => e.TotalProtein ?? 0);
                var totalFat = entries.Sum(e => e.TotalFat ?? 0);

                var result = entries.Select(e => new
                {
                    id = e.Log_id,
                    recipeId = e.Recipe_id,
                    recipeName = e.Recipe?.Recipe_name ?? "Món ăn",
                    mealType = e.MealType,
                    servings = e.Quantity,
                    calories = e.TotalCalories,
                    carbs = e.TotalCarbs,
                    protein = e.TotalProtein,
                    fat = e.TotalFat,
                    date = e.LogDate,
                }).ToList();

                return Ok(new
                {
                    success = true,
                    entries = result,
                    totalCalories,
                    totalCarbs,
                    totalProtein,
                    totalFat,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEntry(Guid id)
        {
            try
            {
                await _nutritionLogService.SoftDeleteNutritionLog(id);
                return Ok(new { success = true, message = "Đã xóa bản ghi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            try
            {
                var accountId = GetAccountId();
                var startDate = start ?? DateTime.UtcNow.AddDays(-7);
                var endDate = end ?? DateTime.UtcNow;

                var entries = await _nutritionLogService.GetNutritionLogsByAccountAndDateRange(accountId, startDate, endDate);

                var dailyTotals = entries
                    .GroupBy(e => e.LogDate.Date)
                    .Select(g => new
                    {
                        date = g.Key.ToString("yyyy-MM-dd"),
                        calories = g.Sum(e => e.TotalCalories ?? 0),
                        carbs = g.Sum(e => e.TotalCarbs ?? 0),
                        protein = g.Sum(e => e.TotalProtein ?? 0),
                        fat = g.Sum(e => e.TotalFat ?? 0),
                        count = g.Count(),
                    })
                    .OrderBy(d => d.date)
                    .ToList();

                var totals = new
                {
                    calories = dailyTotals.Sum(d => d.calories),
                    carbs = dailyTotals.Sum(d => d.carbs),
                    protein = dailyTotals.Sum(d => d.protein),
                    fat = dailyTotals.Sum(d => d.fat),
                    totalDays = dailyTotals.Count,
                };

                return Ok(new { success = true, dailyTotals, totals });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class DiaryEntryRequest
    {
        public Guid? RecipeId { get; set; }
        public string? RecipeName { get; set; }
        public string? MealType { get; set; }
        public double? Servings { get; set; }
        public double? Calories { get; set; }
        public double? Carbs { get; set; }
        public double? Protein { get; set; }
        public double? Fat { get; set; }
        public DateTime? Date { get; set; }
        public string? Note { get; set; }
    }
}
