using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Service.Interfaces;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAccountService _service;
        private readonly IWebHostEnvironment _environment;

        public AuthController(IAccountService service, IWebHostEnvironment environment)
        {
            _service = service;
            _environment = environment;
        }

        [HttpGet("accounts")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAccounts()
        {
            try
            {
                var accounts = await _service.GetAllAccounts();
                var result = accounts.Select(a => new
                {
                    accountId = a.Account_id,
                    username = a.Username,
                    name = a.Name,
                    email = a.Email,
                    phone = a.Phone,
                    role = a.Role.ToString(),
                    isActive = a.IsActive,
                    createdAt = a.CreatedAt,
                    lastLogin = a.LastLogin,
                }).ToList();

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("accounts/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountRequest request)
        {
            try
            {
                var account = await _service.GetAccountById(id);
                if (account == null)
                    return NotFound(new { success = false, message = "Account not found" });

                if (request.IsActive.HasValue)
                    account.IsActive = request.IsActive.Value;
                if (!string.IsNullOrEmpty(request.Name))
                    account.Name = request.Name;
                if (!string.IsNullOrEmpty(request.Email))
                    account.Email = request.Email;
                if (!string.IsNullOrEmpty(request.Phone))
                    account.Phone = request.Phone;

                var updated = await _service.UpdateAccount(account);
                return Ok(new { success = true, data = updated });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _service.Login(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                // Nếu OTP đúng, result sẽ chứa JWT Token
                var result = await _service.VerifyOtp(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _service.Register(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }

        [HttpPost("verify-register-otp")]
        public async Task<IActionResult> VerifyRegisterOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                var result = await _service.VerifyRegisterOtp(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var result = await _service.GoogleLogin(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error: " + ex.Message });
            }
        }

        [HttpPut("avatar")]
        [Authorize]
        public async Task<IActionResult> UpdateAvatar([FromForm] UpdateAvatarRequest request)
        {
            try
            {
                var accountId = GetAccountId();
                string avatarUrl = request.AvatarUrl?.Trim() ?? string.Empty;

                if (request.AvatarFile != null && request.AvatarFile.Length > 0)
                {
                    var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"), "uploads", "avatars");
                    Directory.CreateDirectory(uploadsRoot);

                    var extension = Path.GetExtension(request.AvatarFile.FileName);
                    if (string.IsNullOrWhiteSpace(extension))
                    {
                        extension = ".jpg";
                    }

                    var fileName = $"{accountId}_{Guid.NewGuid():N}{extension}";
                    var filePath = Path.Combine(uploadsRoot, fileName);

                    await using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.AvatarFile.CopyToAsync(stream);
                    }

                    avatarUrl = $"{Request.Scheme}://{Request.Host}/uploads/avatars/{fileName}";
                }

                if (string.IsNullOrWhiteSpace(avatarUrl))
                {
                    return BadRequest(new { success = false, message = "Avatar file is required" });
                }

                var account = await _service.UpdateAvatarUrl(accountId, avatarUrl);
                return Ok(new { success = true, avatarUrl = account.AvatarUrl });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return Guid.Parse(claim.Value);
        }
    }

    public class UpdateAccountRequest
    {
        public bool? IsActive { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }

    public class UpdateAvatarRequest
    {
        public IFormFile? AvatarFile { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
