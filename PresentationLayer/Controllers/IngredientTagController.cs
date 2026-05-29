using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientTagController : ControllerBase
    {
        private readonly IIngredientTagService _ingredientTagService;
        private readonly ILogger<IngredientTagController> _logger;

        public IngredientTagController(IIngredientTagService ingredientTagService, ILogger<IngredientTagController> logger)
        {
            _ingredientTagService = ingredientTagService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả các thẻ nguyên liệu
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var ingredientTags = await _ingredientTagService.GetAllIngredientTags();
                return Ok(new { success = true, data = ingredientTags });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all ingredient tags");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thẻ nguyên liệu theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var ingredientTag = await _ingredientTagService.GetIngredientTagById(id);
                if (ingredientTag == null)
                    return NotFound(new { success = false, message = "IngredientTag not found" });

                return Ok(new { success = true, data = ingredientTag });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ingredient tag by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo thẻ nguyên liệu mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IngredientTagRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredientTag = await _ingredientTagService.CreateIngredientTag(request);
                return CreatedAtAction(nameof(GetById), new { id = ingredientTag.Tag_id }, new { success = true, data = ingredientTag });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ingredient tag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thẻ nguyên liệu
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] IngredientTagRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredientTag = await _ingredientTagService.UpdateIngredientTag(id, request);
                return Ok(new { success = true, data = ingredientTag });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient tag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa mềm thẻ nguyên liệu
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ingredientTag = await _ingredientTagService.SoftDeleteIngredientTag(id);
                return Ok(new { success = true, message = "IngredientTag deleted successfully", data = ingredientTag });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ingredient tag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

