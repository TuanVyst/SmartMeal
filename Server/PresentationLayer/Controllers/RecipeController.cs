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
    public class RecipeController : ControllerBase
    {
        private readonly IRecipeService _recipeService;
        private readonly ILogger<RecipeController> _logger;

        public RecipeController(IRecipeService recipeService, ILogger<RecipeController> logger)
        {
            _recipeService = recipeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _recipeService.GetAllRecipes();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all recipes");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _recipeService.GetRecipeById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Recipe not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipe by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _recipeService.CreateRecipe(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating recipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RecipeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _recipeService.UpdateRecipe(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating recipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _recipeService.SoftDeleteRecipe(id);
                return Ok(new { success = true, message = "Recipe deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("suggest/pantry/{accountId}")]
        public async Task<IActionResult> SuggestRecipesBasedOnPantry(Guid accountId)
        {
            try
            {
                var suggestions = await _recipeService.SuggestRecipesBasedOnPantry(accountId);
                return Ok(new { success = true, data = suggestions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suggesting recipes based on pantry");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
