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
    public class AllergyController : ControllerBase
    {
        private readonly IAllergyService _allergyService;
        private readonly ILogger<AllergyController> _logger;

        public AllergyController(IAllergyService allergyService, ILogger<AllergyController> logger)
        {
            _allergyService = allergyService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? accountId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var items = accountId.HasValue
                    ? await _allergyService.GetAllergiesByAccountId(accountId.Value, cancellationToken)
                    : await _allergyService.GetAllAllergies(cancellationToken);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all allergys");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var item = await _allergyService.GetAllergyById(id, cancellationToken);
                if (item == null)
                    return NotFound(new { success = false, message = "Allergy not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting allergy by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AllergyRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _allergyService.CreateAllergy(request, cancellationToken);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating allergy");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AllergyRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _allergyService.UpdateAllergy(id, request, cancellationToken);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating allergy");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
        {
            try
            {
                var item = await _allergyService.SoftDeleteAllergy(id, cancellationToken);
                return Ok(new { success = true, message = "Allergy deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting allergy");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
