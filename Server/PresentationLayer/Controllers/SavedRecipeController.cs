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
    public class SavedRecipeController : ControllerBase
    {
        private readonly ISavedRecipeService _savedRecipeService;
        private readonly ILogger<SavedRecipeController> _logger;

        public SavedRecipeController(ISavedRecipeService savedRecipeService, ILogger<SavedRecipeController> logger)
        {
            _savedRecipeService = savedRecipeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _savedRecipeService.GetAllSavedRecipes();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all savedRecipes");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _savedRecipeService.GetSavedRecipeById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "SavedRecipe not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting savedRecipe by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("collection/{collectionId}")]
        public async Task<IActionResult> GetByCollectionId(Guid collectionId)
        {
            try
            {
                var items = await _savedRecipeService.GetSavedRecipesByCollectionId(collectionId);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting saved recipes by collection id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> Toggle([FromBody] SavedRecipeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var isAdded = await _savedRecipeService.ToggleSavedRecipe(request.Collection_Id, request.Recipe_Id);
                return Ok(new { success = true, isAdded = isAdded });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling saved recipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SavedRecipeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _savedRecipeService.CreateSavedRecipe(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating savedRecipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SavedRecipeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _savedRecipeService.UpdateSavedRecipe(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating savedRecipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _savedRecipeService.SoftDeleteSavedRecipe(id);
                return Ok(new { success = true, message = "SavedRecipe deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting savedRecipe");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
