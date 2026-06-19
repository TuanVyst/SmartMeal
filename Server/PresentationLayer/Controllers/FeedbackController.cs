using BusinessObject.Dtos.RequestModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _feedbackService.GetAllFeedbacks();
                var result = items.Select(f => new
                {
                    id = f.Feedback_id,
                    accountId = f.Account_id,
                    userName = f.Account?.Name ?? f.Account?.Username,
                    title = f.Title,
                    content = f.Content,
                    rating = f.Rating,
                    createdAt = f.CreatedAt,
                }).ToList();

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var item = await _feedbackService.GetFeedbackById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Feedback not found" });

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = item.Feedback_id,
                        accountId = item.Account_id,
                        userName = item.Account?.Name ?? item.Account?.Username,
                        title = item.Title,
                        content = item.Content,
                        rating = item.Rating,
                        createdAt = item.CreatedAt,
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] FeedbackRequest request)
        {
            try
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null)
                    request.Account_id = Guid.Parse(claim.Value);

                var item = await _feedbackService.CreateFeedback(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
