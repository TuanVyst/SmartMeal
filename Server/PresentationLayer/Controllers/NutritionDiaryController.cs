using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<NutritionDiaryController> _logger;

        public NutritionDiaryController(
            INutritionLogService nutritionLogService,
            IWebHostEnvironment environment,
            ILogger<NutritionDiaryController> logger)
        {
            _nutritionLogService = nutritionLogService;
            _environment = environment;
            _logger = logger;
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
                _logger.LogError(ex, "Failed to add nutrition diary entry");
                return BadRequest(new { success = false, message = GetDetailedErrorMessage(ex) });
            }
        }

        private string GetDetailedErrorMessage(Exception ex)
        {
            if (ex is DbUpdateException dbEx && dbEx.InnerException != null)
                return dbEx.InnerException.Message;

            if (_environment.IsDevelopment())
                return ex.ToString();

            return ex.Message;
        }

        private static DateTime NormalizeQueryDate(DateTime? date)
        {
            var value = date ?? DateTime.UtcNow;
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetByDate([FromQuery] DateTime? date)
        {
            try
            {
                var accountId = GetAccountId();
                var queryDate = NormalizeQueryDate(date);
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
                _logger.LogError(ex, "Failed to get nutrition diary entries for date {Date}", date);
                return BadRequest(new { success = false, message = GetDetailedErrorMessage(ex) });
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
                _logger.LogError(ex, "Failed to delete nutrition diary entry {EntryId}", id);
                return BadRequest(new { success = false, message = GetDetailedErrorMessage(ex) });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            try
            {
                var accountId = GetAccountId();
                var startDate = NormalizeQueryDate(start ?? DateTime.UtcNow.AddDays(-7));
                var endDate = NormalizeQueryDate(end ?? DateTime.UtcNow);

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
                _logger.LogError(ex, "Failed to get nutrition diary summary");
                return BadRequest(new { success = false, message = GetDetailedErrorMessage(ex) });
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
