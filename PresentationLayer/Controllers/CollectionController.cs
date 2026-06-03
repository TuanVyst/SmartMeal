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
    public class CollectionController : ControllerBase
    {
        private readonly ICollectionService _collectionService;
        private readonly ILogger<CollectionController> _logger;

        public CollectionController(ICollectionService collectionService, ILogger<CollectionController> logger)
        {
            _collectionService = collectionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _collectionService.GetAllCollections();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all collections");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _collectionService.GetCollectionById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Collection not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting collection by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CollectionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _collectionService.CreateCollection(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating collection");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CollectionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _collectionService.UpdateCollection(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating collection");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _collectionService.SoftDeleteCollection(id);
                return Ok(new { success = true, message = "Collection deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting collection");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
