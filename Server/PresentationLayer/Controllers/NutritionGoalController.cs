using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NutritionGoalController : ControllerBase
    {
        private readonly INutritionGoalService _nutritionGoalService;
        private readonly ILogger<NutritionGoalController> _logger;

        public NutritionGoalController(INutritionGoalService nutritionGoalService, ILogger<NutritionGoalController> logger)
        {
            _nutritionGoalService = nutritionGoalService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? accountId = null)
        {
            try
            {
                var items = await _nutritionGoalService.GetAllNutritionGoals();
                if (accountId.HasValue)
                {
                    items = items.Where(x => x.Account_id == accountId.Value).ToList();
                }
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all nutritionGoals");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _nutritionGoalService.GetNutritionGoalById(id);

                if (item == null)
                    return NotFound(new { success = false, message = "NutritionGoal not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nutritionGoal by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NutritionGoalRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionGoalService.CreateNutritionGoal(request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating nutritionGoal");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] NutritionGoalRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionGoalService.UpdateNutritionGoal(id, request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating nutritionGoal");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _nutritionGoalService.SoftDeleteNutritionGoal(id);

                return Ok(new { success = true, message = "NutritionGoal deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting nutritionGoal");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
