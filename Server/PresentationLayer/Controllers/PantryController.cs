using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PantryController : ControllerBase
    {
        private readonly IPantryService _pantryService;

        public PantryController(IPantryService pantryService)
        {
            _pantryService = pantryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PantryResponse>>> GetAll()
        {
            var result = await _pantryService.GetAllPantries();
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<PantryResponse>> GetById(Guid id)
        {
            var result = await _pantryService.GetPantryById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("account/{accountId:guid}")]
        public async Task<ActionResult<IEnumerable<PantryResponse>>> GetByAccountId(Guid accountId)
        {
            var result = await _pantryService.GetPantriesByAccountId(accountId);
            return Ok(result);
        }

        [HttpGet("ingredient/{ingredientId:guid}")]
        public async Task<ActionResult<IEnumerable<PantryResponse>>> GetByIngredientId(Guid ingredientId)
        {
            var result = await _pantryService.GetPantriesByIngredientId(ingredientId);
            return Ok(result);
        }

        [HttpGet("expiring/{accountId:guid}")]
        public async Task<ActionResult<IEnumerable<PantryResponse>>> GetExpiring(Guid accountId, [FromQuery] int daysThreshold = 7)
        {
            var result = await _pantryService.GetExpiringPantries(accountId, daysThreshold);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<PantryResponse>> Create([FromBody] PantryRequest request, [FromQuery] Guid accountId)
        {
            var result = await _pantryService.CreatePantry(request, accountId);
            return CreatedAtAction(nameof(GetById), new { id = result.Pantry_id }, result);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<PantryResponse>> Update(Guid id, [FromBody] PantryUpdateRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _pantryService.UpdatePantry(id, request, accountId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<PantryResponse>> SoftDelete(Guid id, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _pantryService.SoftDeletePantry(id, accountId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }
    }
}
