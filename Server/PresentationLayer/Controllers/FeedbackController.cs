using BusinessObject.DTOs.RequestModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Service.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly ILogger<FeedbackController> _logger;

        public FeedbackController(IFeedbackService feedbackService, ILogger<FeedbackController> logger)
        {
            _feedbackService = feedbackService;
            _logger = logger;
        }

        private Guid? GetCurrentAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && Guid.TryParse(claim.Value, out var id))
            {
                return id;
            }
            return null;
        }

        /// <summary>
        /// Người dùng gửi phản hồi / góp ý / báo lỗi
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackRequest request)
        {
            try
            {
                var accountId = GetCurrentAccountId();
                if (!accountId.HasValue)
                {
                    return Unauthorized(new { success = false, message = "Không xác định được danh tính người dùng." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ.", errors = ModelState });
                }

                var result = await _feedbackService.CreateFeedbackAsync(accountId.Value, request);
                return Ok(new
                {
                    success = true,
                    message = "Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất qua email của bạn.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo phản hồi người dùng.");
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi gửi phản hồi: " + ex.Message });
            }
        }

        /// <summary>
        /// Người dùng xem lại các phản hồi mình đã gửi
        /// </summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyFeedbacks()
        {
            try
            {
                var accountId = GetCurrentAccountId();
                if (!accountId.HasValue)
                {
                    return Unauthorized(new { success = false, message = "Không xác định được danh tính người dùng." });
                }

                var list = await _feedbackService.GetMyFeedbacksAsync(accountId.Value);
                return Ok(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi của người dùng.");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Quản trị viên lấy danh sách phản hồi (phân trang, lọc theo trạng thái, loại)
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetFeedbacksForAdmin([FromQuery] FeedbackFilterRequest request)
        {
            try
            {
                var result = await _feedbackService.GetFeedbacksPagedAsync(request);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quản trị viên lấy danh sách phản hồi.");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Quản trị viên xem chi tiết một phản hồi
        /// </summary>
        [HttpGet("admin/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetFeedbackById(Guid id)
        {
            try
            {
                var result = await _feedbackService.GetFeedbackByIdAsync(id);
                if (result == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy phản hồi." });
                }
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quản trị viên xem chi tiết phản hồi {Id}.", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Quản trị viên trả lời phản hồi và gửi email thông báo cho người dùng
        /// </summary>
        [HttpPut("admin/{id:guid}/reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyFeedback(Guid id, [FromBody] ReplyFeedbackRequest request)
        {
            try
            {
                var adminId = GetCurrentAccountId();
                if (!adminId.HasValue)
                {
                    return Unauthorized(new { success = false, message = "Không xác định được tài khoản quản trị viên." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Nội dung phản hồi không hợp lệ.", errors = ModelState });
                }

                var result = await _feedbackService.ReplyFeedbackAsync(id, adminId.Value, request);
                return Ok(new
                {
                    success = true,
                    message = "Đã gửi câu trả lời thành công và gửi email thông báo cho người dùng.",
                    data = result
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quản trị viên trả lời phản hồi {Id}.", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi trả lời phản hồi: " + ex.Message });
            }
        }

        /// <summary>
        /// Quản trị viên xóa (soft delete) phản hồi
        /// </summary>
        [HttpDelete("admin/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFeedback(Guid id)
        {
            try
            {
                var success = await _feedbackService.DeleteFeedbackAsync(id);
                if (!success)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy phản hồi cần xóa." });
                }
                return Ok(new { success = true, message = "Đã xóa phản hồi thành công." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa phản hồi {Id}.", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
