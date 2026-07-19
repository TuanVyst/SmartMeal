using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipeController : ControllerBase
    {
        private readonly IRecipeService _recipeService;
        private readonly ILogger<RecipeController> _logger;
        private readonly AppDbContext _ctx;

        public RecipeController(IRecipeService recipeService, ILogger<RecipeController> logger, AppDbContext ctx)
        {
            _recipeService = recipeService;
            _logger = logger;
            _ctx = ctx;
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

        [HttpGet("recommended-for-me")]
        [Authorize]
        public async Task<IActionResult> GetRecommendedForMe()
        {
            try
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim == null) return Unauthorized();
                var accountId = Guid.Parse(claim.Value);

                // Get user's active diet plans
                var dietPlans = await _ctx.UserDietPlans
                    .Where(u => u.Account_id == accountId && u.IsActive && !u.IsDeleted)
                    .Join(_ctx.DietPlans, 
                          u => u.Diet_id, 
                          d => d.Diet_id, 
                          (u, d) => d)
                    .ToListAsync();

                var allRecipes = await _recipeService.GetAllRecipes();

                if (!dietPlans.Any())
                {
                    return Ok(new { success = true, data = allRecipes.Take(10) }); // default recommendation
                }

                // If user has a diet plan, we try to recommend recipes based on the DietPlan Name 
                // containing keywords that might match recipe tags or recipe names.
                // For a more advanced version, this would filter by Macros (MaxCarbs, MinProtein, etc.)
                var keywords = dietPlans.Select(d => d.Name.ToLower()).ToList();
                
                var recommended = allRecipes.Where(r => 
                    keywords.Any(k => 
                        (r.Recipe_name != null && k.Contains(r.Recipe_name.ToLower())) || 
                        (r.Recipe_name != null && r.Recipe_name.ToLower().Contains(k)) ||
                        (r.RecipeLabels != null && r.RecipeLabels.Any(t => k.Contains(t.LabelName.ToLower()) || t.LabelName.ToLower().Contains(k))) ||
                        k.Contains("tiểu đường") // just recommend all for demo if it's complex
                    )
                ).ToList();

                // fallback if strict matching yields empty
                if (!recommended.Any()) 
                {
                    recommended = allRecipes.Take(10).ToList();
                }

                return Ok(new { success = true, data = recommended, activeDietPlans = dietPlans.Select(d => d.Name) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended recipes");
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

        [HttpGet("ingredients")]
        public async Task<IActionResult> GetByIngredients([FromQuery] List<Guid> ingredientIds)
        {
            try
            {
                var items = await _recipeService.GetRecipeByIngredients(ingredientIds);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recipes by ingredients");
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
