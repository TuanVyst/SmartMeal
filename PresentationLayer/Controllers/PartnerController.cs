using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartnerController : ControllerBase
    {
        private readonly IPartnerService _partnerService;
        private readonly ILogger<PartnerController> _logger;

        public PartnerController(IPartnerService partnerService, ILogger<PartnerController> logger)
        {
            _partnerService = partnerService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả các đối tác
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var partners = await _partnerService.GetAllPartners();
                return Ok(new { success = true, data = partners });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all partners");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy đối tác theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var partner = await _partnerService.GetPartnerById(id);
                if (partner == null)
                    return NotFound(new { success = false, message = "Partner not found" });

                return Ok(new { success = true, data = partner });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting partner by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo đối tác mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PartnerRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var partner = await _partnerService.CreatePartner(request);
                return CreatedAtAction(nameof(GetById), new { id = partner.Partner_id }, new { success = true, data = partner });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating partner");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật đối tác
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] PartnerRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var partner = await _partnerService.UpdatePartner(id, request);
                return Ok(new { success = true, data = partner });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating partner");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa mềm đối tác
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var partner = await _partnerService.SoftDeletePartner(id);
                return Ok(new { success = true, message = "Partner deleted successfully", data = partner });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting partner");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

