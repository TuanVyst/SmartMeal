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
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly ILogger<CommentController> _logger;

        public CommentController(ICommentService commentService, ILogger<CommentController> logger)
        {
            _commentService = commentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _commentService.GetAllComments();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all comments");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _commentService.GetCommentById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Comment not found" });

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comment by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _commentService.CreateComment(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CommentRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid model", errors = ModelState });

                var item = await _commentService.UpdateComment(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var item = await _commentService.SoftDeleteComment(id);
                return Ok(new { success = true, message = "Comment deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
