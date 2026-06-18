using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConditionDietRecommendationController : ControllerBase
    {
        private readonly IConditionDietRecommendationService _conditionDietRecommendationService;
        private readonly ILogger<ConditionDietRecommendationController> _logger;

        public ConditionDietRecommendationController(
            IConditionDietRecommendationService conditionDietRecommendationService,
            ILogger<ConditionDietRecommendationController> logger)
        {
            _conditionDietRecommendationService = conditionDietRecommendationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _conditionDietRecommendationService.GetAllConditionDietRecommendations();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all conditionDietRecommendations");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _conditionDietRecommendationService.GetConditionDietRecommendationById(id);

                if (item == null)
                    return NotFound(new { success = false, message = "ConditionDietRecommendation not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conditionDietRecommendation by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ConditionDietRecommendationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _conditionDietRecommendationService.CreateConditionDietRecommendation(request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating conditionDietRecommendation");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ConditionDietRecommendationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _conditionDietRecommendationService.UpdateConditionDietRecommendation(id, request);

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating conditionDietRecommendation");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _conditionDietRecommendationService.SoftDeleteConditionDietRecommendation(id);

                return Ok(new { success = true, message = "ConditionDietRecommendation deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting conditionDietRecommendation");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
