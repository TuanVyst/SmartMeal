using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using BusinessObject.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAccountService _service;
        private readonly ICloudinaryService _cloudinaryService;

        public AuthController(IAccountService service, ICloudinaryService cloudinaryService)
        {
            _service = service;
            _cloudinaryService = cloudinaryService;
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

                var currentUserId = GetCurrentAccountId();

                // Bảo vệ an toàn: Không cho phép vô hiệu hóa tài khoản Quản trị viên
                if (request.IsActive.HasValue && !request.IsActive.Value)
                {
                    if (account.Role == RoleEnum.Admin)
                    {
                        return BadRequest(new { success = false, message = "Không thể vô hiệu hóa tài khoản Quản trị viên." });
                    }
                    if (currentUserId.HasValue && account.Account_id == currentUserId.Value)
                    {
                        return BadRequest(new { success = false, message = "Bạn không thể tự vô hiệu hóa tài khoản của chính mình." });
                    }
                }

                // Cập nhật vai trò nếu được cung cấp
                if (!string.IsNullOrWhiteSpace(request.Role))
                {
                    if (Enum.TryParse<RoleEnum>(request.Role, true, out var newRole))
                    {
                        // Bảo vệ: Quản trị viên không thể tự hạ quyền của chính mình
                        if (currentUserId.HasValue && account.Account_id == currentUserId.Value && account.Role == RoleEnum.Admin && newRole != RoleEnum.Admin)
                        {
                            return BadRequest(new { success = false, message = "Bạn không thể tự hạ quyền Quản trị viên của chính mình." });
                        }
                        account.Role = newRole;
                    }
                }

                if (request.IsActive.HasValue)
                {
                    // Tài khoản Admin luôn được giữ ở trạng thái Active
                    account.IsActive = account.Role == RoleEnum.Admin ? true : request.IsActive.Value;
                }

                if (request.Name != null)
                    account.Name = request.Name.Trim();
                if (request.Email != null)
                    account.Email = request.Email.Trim();
                if (request.Phone != null)
                    account.Phone = request.Phone.Trim();

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
                    using var stream = request.AvatarFile.OpenReadStream();
                    avatarUrl = await _cloudinaryService.UploadImageAsync(stream, request.AvatarFile.FileName);
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

        private Guid? GetCurrentAccountId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim != null && Guid.TryParse(claim.Value, out var id))
                return id;
            return null;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return Guid.Parse(claim!.Value);
        }
    }

    public class UpdateAccountRequest
    {
        public bool? IsActive { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
    }

    public class UpdateAvatarRequest
    {
        public IFormFile? AvatarFile { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
