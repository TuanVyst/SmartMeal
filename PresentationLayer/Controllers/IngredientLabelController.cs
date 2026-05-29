using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientLabelController : ControllerBase
    {
        private readonly IIngredientLabelService _ingredientLabelService;
        private readonly ILogger<IngredientLabelController> _logger;

        public IngredientLabelController(IIngredientLabelService ingredientLabelService, ILogger<IngredientLabelController> logger)
        {
            _ingredientLabelService = ingredientLabelService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả các nhãn nguyên liệu
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var ingredientLabels = await _ingredientLabelService.GetAllIngredientLabels();
                return Ok(new { success = true, data = ingredientLabels });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all ingredient labels");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy nhãn nguyên liệu theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var ingredientLabel = await _ingredientLabelService.GetIngredientLabelById(id);
                if (ingredientLabel == null)
                    return NotFound(new { success = false, message = "IngredientLabel not found" });

                return Ok(new { success = true, data = ingredientLabel });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ingredient label by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo nhãn nguyên liệu mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IngredientLabelRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredientLabel = await _ingredientLabelService.CreateIngredientLabel(request);
                return CreatedAtAction(nameof(GetById), new { id = ingredientLabel.Label_id }, new { success = true, data = ingredientLabel });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ingredient label");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật nhãn nguyên liệu
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] IngredientLabelRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredientLabel = await _ingredientLabelService.UpdateIngredientLabel(id, request);
                return Ok(new { success = true, data = ingredientLabel });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient label");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa mềm nhãn nguyên liệu
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ingredientLabel = await _ingredientLabelService.SoftDeleteIngredientLabel(id);
                return Ok(new { success = true, message = "IngredientLabel deleted successfully", data = ingredientLabel });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ingredient label");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

