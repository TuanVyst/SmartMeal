using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeTagController : ControllerBase
    {
        private readonly IRecipeTagService _service;

        public RecipeTagController(IRecipeTagService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _service.GetAllRecipeTags()); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _service.GetRecipeTagById(id);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeTagRequest request)
        {
            try
            {
                var created = await _service.CreateRecipeTag(request);
                return CreatedAtAction(nameof(GetById), new { id = created.Rt_Id }, created);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RecipeTagRequest request)
        {
            try { return Ok(await _service.UpdateRecipeTag(id, request)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { return Ok(await _service.DeleteRecipeTag(id)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
