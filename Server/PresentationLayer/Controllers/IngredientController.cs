using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientController : ControllerBase
    {
        private readonly IIngredientService _ingredientService;
        private readonly ILogger<IngredientController> _logger;

        public IngredientController(IIngredientService ingredientService, ILogger<IngredientController> logger)
        {
            _ingredientService = ingredientService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả các nguyên liệu
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var ingredients = await _ingredientService.GetAllIngredients();
                return Ok(new { success = true, data = ingredients });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all ingredients");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy nguyên liệu theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var ingredient = await _ingredientService.GetIngredientById(id);
                if (ingredient == null)
                    return NotFound(new { success = false, message = "Ingredient not found" });

                return Ok(new { success = true, data = ingredient });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ingredient by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo nguyên liệu mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] IngredientRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredient = await _ingredientService.CreateIngredient(request);
                return CreatedAtAction(nameof(GetById), new { id = ingredient.Ingredient_id }, new { success = true, data = ingredient });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ingredient");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật nguyên liệu
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] IngredientRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var ingredient = await _ingredientService.UpdateIngredient(id, request);
                return Ok(new { success = true, data = ingredient });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ingredient");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa mềm nguyên liệu
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var ingredient = await _ingredientService.SoftDeleteIngredient(id);
                return Ok(new { success = true, message = "Ingredient deleted successfully", data = ingredient });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ingredient");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

