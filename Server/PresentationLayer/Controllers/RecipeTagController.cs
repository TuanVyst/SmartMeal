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
    public class RecipeTagController : ControllerBase
    {
        private readonly IRecipeTagService _recipeTagService;
        private readonly ILogger<RecipeTagController> _logger;

        public RecipeTagController(IRecipeTagService recipeTagService, ILogger<RecipeTagController> logger)
        {
            _recipeTagService = recipeTagService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _recipeTagService.GetAllRecipeTags();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all recipeTags");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _recipeTagService.GetRecipeTagById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "RecipeTag not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipeTag by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeTagRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _recipeTagService.CreateRecipeTag(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recipeTag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RecipeTagRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _recipeTagService.UpdateRecipeTag(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recipeTag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _recipeTagService.SoftDeleteRecipeTag(id);
                return Ok(new { success = true, message = "RecipeTag deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recipeTag");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
