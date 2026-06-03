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
    public class NutritionalValueController : ControllerBase
    {
        private readonly INutritionalValueService _nutritionalValueService;
        private readonly ILogger<NutritionalValueController> _logger;

        public NutritionalValueController(INutritionalValueService nutritionalValueService, ILogger<NutritionalValueController> logger)
        {
            _nutritionalValueService = nutritionalValueService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _nutritionalValueService.GetAllNutritionalValues();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all nutritionalValues");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _nutritionalValueService.GetNutritionalValueById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "NutritionalValue not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nutritionalValue by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NutritionalValueRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionalValueService.CreateNutritionalValue(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating nutritionalValue");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] NutritionalValueRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _nutritionalValueService.UpdateNutritionalValue(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating nutritionalValue");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _nutritionalValueService.SoftDeleteNutritionalValue(id);
                return Ok(new { success = true, message = "NutritionalValue deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting nutritionalValue");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
