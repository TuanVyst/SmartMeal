using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController : ControllerBase
    {
        private readonly IRecipeService _recipeService;

        public RecipeController(IRecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRecipes()
        {
            try
            {
                var recipes = await _recipeService.GetAllRecipes();
                return Ok(recipes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRecipeById(Guid id)
        {
            try
            {
                var recipe = await _recipeService.GetRecipeById(id);
                if (recipe == null) return NotFound("Recipe not found");
                return Ok(recipe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecipe([FromBody] RecipeRequest request)
        {
            try
            {
                var createdRecipe = await _recipeService.CreateRecipe(request);
                return CreatedAtAction(nameof(GetRecipeById), new { id = createdRecipe.Recipe_id }, createdRecipe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecipe(Guid id, [FromBody] RecipeRequest request)
        {
            try
            {
                var updatedRecipe = await _recipeService.UpdateRecipe(id, request);
                return Ok(updatedRecipe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(Guid id)
        {
            try
            {
                var deletedRecipe = await _recipeService.DeleteRecipe(id);
                return Ok(deletedRecipe);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
