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
    public class AllergyController : ControllerBase
    {
        private readonly IAllergyService _allergyService;

        public AllergyController(IAllergyService allergyService)
        {
            _allergyService = allergyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AllergyResponse>>> GetAll()
        {
            var result = await _allergyService.GetAllAllergies();
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<AllergyResponse>> GetById(Guid id)
        {
            var result = await _allergyService.GetAllergyById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("account/{accountId:guid}")]
        public async Task<ActionResult<IEnumerable<AllergyResponse>>> GetByAccountId(Guid accountId)
        {
            var result = await _allergyService.GetAllergiesByAccountId(accountId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<AllergyResponse>> Create([FromBody] AllergyRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _allergyService.CreateAllergy(request, accountId);
                return CreatedAtAction(nameof(GetById), new { id = result.Allergy_id }, result);
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
        public async Task<ActionResult<AllergyResponse>> Update(Guid id, [FromBody] AllergyRequest request, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _allergyService.UpdateAllergy(id, request, accountId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
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
        public async Task<ActionResult<AllergyResponse>> SoftDelete(Guid id, [FromQuery] Guid accountId)
        {
            try
            {
                var result = await _allergyService.SoftDeleteAllergy(id, accountId);
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
