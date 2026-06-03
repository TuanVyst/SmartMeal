using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeIngredientController : ControllerBase
    {
        private readonly IRecipeIngredientService _service;

        public RecipeIngredientController(IRecipeIngredientService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _service.GetAllRecipeIngredients()); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _service.GetRecipeIngredientById(id);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeIngredientRequest request)
        {
            try
            {
                var created = await _service.CreateRecipeIngredient(request);
                return CreatedAtAction(nameof(GetById), new { id = created.RI_id }, created);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RecipeIngredientRequest request)
        {
            try { return Ok(await _service.UpdateRecipeIngredient(id, request)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { return Ok(await _service.DeleteRecipeIngredient(id)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
