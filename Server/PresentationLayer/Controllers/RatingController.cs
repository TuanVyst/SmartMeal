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
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RatingResponse>>> GetAll()
        {
            var result = await _ratingService.GetAllRatings();
            return Ok(result);
        }

        [HttpGet("recipe/{recipeId:guid}")]
        public async Task<ActionResult<IEnumerable<RatingResponse>>> GetByRecipeId(Guid recipeId)
        {
            var result = await _ratingService.GetRatingsByRecipeId(recipeId);
            return Ok(result);
        }

        [HttpGet("user/{accountId:guid}")]
        public async Task<ActionResult<IEnumerable<RatingResponse>>> GetByAccountId(Guid accountId)
        {
            var result = await _ratingService.GetRatingsByAccountId(accountId);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<RatingResponse>> GetById(Guid id)
        {
            var result = await _ratingService.GetRatingById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<RatingResponse>> Create([FromBody] RatingRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _ratingService.CreateRating(request, accountId);
                return CreatedAtAction(nameof(GetById), new { id = result.Rating_id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<RatingResponse>> Update(Guid id, [FromBody] RatingUpdateRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _ratingService.UpdateRating(id, request, accountId);
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
        public async Task<ActionResult<RatingResponse>> SoftDelete(Guid id, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _ratingService.SoftDeleteRating(id, accountId);
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
