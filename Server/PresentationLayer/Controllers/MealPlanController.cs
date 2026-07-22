using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MealPlanController : ControllerBase
    {
        private readonly IMealPlanningService _mealPlanningService;

        public MealPlanController(IMealPlanningService mealPlanningService)
        {
            _mealPlanningService = mealPlanningService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePlanPreview([FromQuery] int days = 7)
        {
            try
            {
                var accountId = GetAccountId();
                var plan = await _mealPlanningService.GeneratePlanPreviewAsync(accountId, days);
                return Ok(new { data = plan });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmPlan(Guid id)
        {
            try
            {
                var accountId = GetAccountId();
                var plan = await _mealPlanningService.ConfirmPlanAsync(id);
                return Ok(new { data = plan, message = "Đã xác nhận thực đơn." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActivePlan()
        {
            try
            {
                var accountId = GetAccountId();
                var plan = await _mealPlanningService.GetActivePlanAsync(accountId);
                return Ok(new { data = plan });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPlans()
        {
            try
            {
                var accountId = GetAccountId();
                var plans = await _mealPlanningService.GetAllPlansAsync(accountId);
                return Ok(new { data = plans });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("check-date")]
        public async Task<IActionResult> CheckDateMeals([FromQuery] DateTime date)
        {
            try
            {
                var accountId = GetAccountId();
                var result = await _mealPlanningService.CheckDateMealsAsync(accountId, date);
                return Ok(new { data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("suggest-for-date")]
        public async Task<IActionResult> SuggestForDate([FromQuery] DateTime date, [FromQuery] string meals = null)
        {
            try
            {
                var accountId = GetAccountId();
                var mealList = !string.IsNullOrEmpty(meals)
                    ? meals.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                    : null;
                var plan = await _mealPlanningService.SuggestForDateAsync(accountId, date, mealList);
                return Ok(new { data = plan });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException ex)
            {
                var entry = ex.Entries.FirstOrDefault();
                string entityName = entry?.Entity?.GetType().Name ?? "Unknown";
                string state = entry?.State.ToString() ?? "Unknown";
                string details = $"Concurrency Exception on {entityName} (State: {state}). Message: {ex.Message}";
                Console.WriteLine($"[DB ERROR] {details}");
                return BadRequest(new { message = details });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public class SwapRecipeDto
        {
            public Guid EntryId { get; set; }
            public Guid NewRecipeId { get; set; }
        }

        [HttpPost("suggest-next")]
        public async Task<IActionResult> SuggestNextDay()
        {
            try
            {
                var accountId = GetAccountId();
                var plan = await _mealPlanningService.SuggestNextDayAsync(accountId);
                return Ok(new { data = plan });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/swap")]
        public async Task<IActionResult> SwapRecipe(Guid id, [FromBody] SwapRecipeDto dto)
        {
            try
            {
                var accountId = GetAccountId();
                var plan = await _mealPlanningService.SwapRecipeAsync(id, dto.EntryId, dto.NewRecipeId);
                return Ok(new { data = plan, message = "Đã đổi món thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/entry/{entryId}")]
        public async Task<IActionResult> RemoveEntry(Guid id, Guid entryId)
        {
            try
            {
                var plan = await _mealPlanningService.RemoveEntryAsync(id, entryId);
                return Ok(new { data = plan, message = "Đã huỷ món thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var accountId))
            {
                throw new UnauthorizedAccessException("Invalid token.");
            }
            return accountId;
        }
    }
}
