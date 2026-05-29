using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AffiliateProductController : ControllerBase
    {
        private readonly IAffiliateProductService _affiliateProductService;
        private readonly ILogger<AffiliateProductController> _logger;

        public AffiliateProductController(IAffiliateProductService affiliateProductService, ILogger<AffiliateProductController> logger)
        {
            _affiliateProductService = affiliateProductService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả sản phẩm liên kết
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var affiliateProducts = await _affiliateProductService.GetAllAffiliateProducts();
                return Ok(new { success = true, data = affiliateProducts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all affiliate products");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy sản phẩm liên kết theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var affiliateProduct = await _affiliateProductService.GetAffiliateProductById(id);
                if (affiliateProduct == null)
                    return NotFound(new { success = false, message = "AffiliateProduct not found" });

                return Ok(new { success = true, data = affiliateProduct });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting affiliate product by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo sản phẩm liên kết mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AffiliateProductRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var affiliateProduct = await _affiliateProductService.CreateAffiliateProduct(request);
                return CreatedAtAction(nameof(GetById), new { id = affiliateProduct.Product_id }, new { success = true, data = affiliateProduct });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating affiliate product");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật sản phẩm liên kết
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AffiliateProductRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var affiliateProduct = await _affiliateProductService.UpdateAffiliateProduct(id, request);
                return Ok(new { success = true, data = affiliateProduct });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating affiliate product");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa mềm sản phẩm liên kết
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var affiliateProduct = await _affiliateProductService.SoftDeleteAffiliateProduct(id);
                return Ok(new { success = true, message = "AffiliateProduct deleted successfully", data = affiliateProduct });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting affiliate product");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

