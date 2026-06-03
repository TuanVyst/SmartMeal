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
    public class GroceryListController : ControllerBase
    {
        private readonly IGroceryListService _groceryListService;

        public GroceryListController(IGroceryListService groceryListService)
        {
            _groceryListService = groceryListService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GroceryListResponse>>> GetAll()
        {
            var result = await _groceryListService.GetAllGroceryLists();
            return Ok(result);
        }

        [HttpGet("account/{accountId:guid}")]
        public async Task<ActionResult<IEnumerable<GroceryListResponse>>> GetByAccountId(Guid accountId)
        {
            var result = await _groceryListService.GetGroceryListsByAccountId(accountId);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GroceryListResponse>> GetById(Guid id)
        {
            var result = await _groceryListService.GetGroceryListById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<GroceryListResponse>> Create([FromBody] GroceryListRequest request, [FromQuery] Guid accountId)
        {
            var result = await _groceryListService.CreateGroceryList(request, accountId);
            return CreatedAtAction(nameof(GetById), new { id = result.List_id }, result);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<GroceryListResponse>> Update(Guid id, [FromBody] GroceryListUpdateRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _groceryListService.UpdateGroceryList(id, request, accountId);
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
        public async Task<ActionResult<GroceryListResponse>> SoftDelete(Guid id, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _groceryListService.SoftDeleteGroceryList(id, accountId);
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
