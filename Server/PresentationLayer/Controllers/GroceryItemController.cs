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
    public class GroceryItemController : ControllerBase
    {
        private readonly IGroceryItemService _groceryItemService;

        public GroceryItemController(IGroceryItemService groceryItemService)
        {
            _groceryItemService = groceryItemService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GroceryItemResponse>>> GetAll()
        {
            var result = await _groceryItemService.GetAllGroceryItems();
            return Ok(result);
        }

        [HttpGet("list/{listId:guid}")]
        public async Task<ActionResult<IEnumerable<GroceryItemResponse>>> GetByListId(Guid listId)
        {
            var result = await _groceryItemService.GetGroceryItemsByListId(listId);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GroceryItemResponse>> GetById(Guid id)
        {
            var result = await _groceryItemService.GetGroceryItemById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<GroceryItemResponse>> Create([FromBody] GroceryItemRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _groceryItemService.CreateGroceryItem(request, accountId);
                return CreatedAtAction(nameof(GetById), new { id = result.Item_id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<GroceryItemResponse>> Update(Guid id, [FromBody] GroceryItemUpdateRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _groceryItemService.UpdateGroceryItem(id, request, accountId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<GroceryItemResponse>> SoftDelete(Guid id, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _groceryItemService.SoftDeleteGroceryItem(id, accountId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
        }
    }
}
