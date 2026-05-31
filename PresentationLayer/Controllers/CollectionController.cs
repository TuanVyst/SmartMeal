using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CollectionController : ControllerBase
    {
        private readonly ICollectionService _collectionService;

        public CollectionController(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _collectionService.GetAllCollections()); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var collection = await _collectionService.GetCollectionById(id);
                if (collection == null) return NotFound();
                return Ok(collection);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CollectionRequest request)
        {
            try
            {
                var created = await _collectionService.CreateCollection(request);
                return CreatedAtAction(nameof(GetById), new { id = created.Collection_id }, created);
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CollectionRequest request)
        {
            try { return Ok(await _collectionService.UpdateCollection(id, request)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try { return Ok(await _collectionService.DeleteCollection(id)); }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}
