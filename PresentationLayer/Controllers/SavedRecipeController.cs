using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedRecipeController : ControllerBase
    {
        private readonly ISavedRecipeService _service;

        public SavedRecipeController(ISavedRecipeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _service.GetAllSavedRecipes()); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _service.GetSavedRecipeById(id);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SavedRecipeRequest request)
        {
            try
            {
                var created = await _service.CreateSavedRecipe(request);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SavedRecipeRequest request)
        {
            try { return Ok(await _service.UpdateSavedRecipe(id, request)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { return Ok(await _service.DeleteSavedRecipe(id)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
