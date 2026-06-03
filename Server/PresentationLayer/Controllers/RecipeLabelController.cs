using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeLabelController : ControllerBase
    {
        private readonly IRecipeLabelService _service;

        public RecipeLabelController(IRecipeLabelService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _service.GetAllRecipeLabels()); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _service.GetRecipeLabelById(id);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RecipeLabelRequest request)
        {
            try
            {
                var created = await _service.CreateRecipeLabel(request);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RecipeLabelRequest request)
        {
            try { return Ok(await _service.UpdateRecipeLabel(id, request)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { return Ok(await _service.DeleteRecipeLabel(id)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
