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
    public class NutritionLogController : ControllerBase
    {
        private readonly INutritionLogService _nutritionLogService;
        private readonly ILogger<NutritionLogController> _logger;

        public NutritionLogController(INutritionLogService nutritionLogService, ILogger<NutritionLogController> logger)
        {
            _nutritionLogService = nutritionLogService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? accountId = null)
        {
            try
            {
                var items = await _nutritionLogService.GetAllNutritionLogs();
                if (accountId.HasValue)
                {
                    items = items.Where(x => x.Account_id == accountId.Value).ToList();
                }
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all nutritionLogs");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _nutritionLogService.GetNutritionLogById(id);

                if (item == null)
                    return NotFound(new { success = false, message = "NutritionLog not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nutritionLog by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NutritionLogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionLogService.CreateNutritionLog(request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating nutritionLog");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] NutritionLogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionLogService.UpdateNutritionLog(id, request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating nutritionLog");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _nutritionLogService.SoftDeleteNutritionLog(id);

                return Ok(new { success = true, message = "NutritionLog deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting nutritionLog");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
