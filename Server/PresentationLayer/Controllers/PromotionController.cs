using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Service.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class PromotionController : ControllerBase
    {
        private readonly IPromotionService _promotionService;
        private readonly ILogger<PromotionController> _logger;

        public PromotionController(IPromotionService promotionService, ILogger<PromotionController> logger)
        {
            _promotionService = promotionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _promotionService.GetAllAsync();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting promotions");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _promotionService.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Không tìm thấy khuyến mãi" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting promotion {PromoId}", id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PromotionRequest request)
        {
            try
            {
                var item = await _promotionService.CreateAsync(request, CurrentAccountId());
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating promotion");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PromotionRequest request)
        {
            try
            {
                var item = await _promotionService.UpdateAsync(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating promotion {PromoId}", id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/end")]
        public async Task<IActionResult> End(Guid id)
        {
            try
            {
                var item = await _promotionService.EndAsync(id);
                return Ok(new { success = true, data = item });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending promotion {PromoId}", id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _promotionService.DeleteAsync(id);
                return Ok(new { success = true, message = "Đã xoá khuyến mãi", data = item });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting promotion {PromoId}", id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private Guid? CurrentAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim?.Value, out var id) ? id : null;
        }
    }
}
