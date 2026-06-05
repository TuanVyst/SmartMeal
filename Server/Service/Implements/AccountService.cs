using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repository.Interfaces;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Service.Implements
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepo _accountRepo;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public AccountService(IAccountRepo repo, IConfiguration config, IEmailService emailService, IMemoryCache cache)
        {
            _accountRepo = repo;
            _config = config;
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<Account> AddAccount(Account account)
        {
            return await _accountRepo.AddAccount(account);
        }

        public async Task DeleteAccount(Guid id)
        {
            await _accountRepo.DeleteAccount(id);
        }

        public async Task<Account> GetAccountById(Guid id)
        {
            return await _accountRepo.GetAccountById(id);
        }

        public async Task<List<Account>> GetAllAccounts()
        {
            return await _accountRepo.GetAllAccounts();
        }

        public async Task<Account> UpdateAccount(Account account)
        {
            return await _accountRepo.UpdateAccount(account);
        }

        public async Task<AuthResponseDto> Login(LoginRequest request)
        {
            var account = await _accountRepo.GetAccountByUsername(request.EmailOrUsername)
                         ?? await _accountRepo.GetAccountByEmail(request.EmailOrUsername);

            if (account == null || !BCrypt.Net.BCrypt.Verify(request.Password, account.Password))
            {
                throw new UnauthorizedAccessException("Invalid username/email or password");
            }

            if (!account.IsActive)
            {
                throw new UnauthorizedAccessException("Account is disabled");
            }

            var requireOtp = !account.LastLogin.HasValue || (DateTime.UtcNow - account.LastLogin.Value) > TimeSpan.FromDays(1);

            if (requireOtp)
            {
                // 1. Gửi OTP qua email
                await _emailService.RequestOtpAsync(account.Email);

         
                return new AuthResponseDto
                {
                    RequiresOtp = true,
                    Email = account.Email 
                };
            }

            // Nếu không cần OTP -> Cập nhật LastLogin và tạo Token
            account.LastLogin = DateTime.UtcNow;
            await _accountRepo.UpdateAccount(account);

            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> VerifyOtp(VerifyOtpRequest request)
        {
            var isExist = _cache.TryGetValue($"OTP_{request.Email}", out string savedOtp);

            if (!isExist)
            {
                // Dùng UnauthorizedAccessException cho lỗi xác thực thay vì Exception chung
                throw new UnauthorizedAccessException("Mã OTP đã hết hạn hoặc không tồn tại.");
            }
            if (savedOtp != request.OtpCode)
            {
                throw new UnauthorizedAccessException("Mã OTP không chính xác.");
            }

            // Xác thực thành công -> Xóa OTP khỏi cache
            _cache.Remove($"OTP_{request.Email}");

            // Lấy lại thông tin user để sinh token
            var account = await _accountRepo.GetAccountByEmail(request.Email);
            if (account == null)
            {
                throw new Exception("Tài khoản không tồn tại");
            }

            // Cập nhật LastLogin
            account.LastLogin = DateTime.UtcNow;
            await _accountRepo.UpdateAccount(account);

            // Trả về Token để người dùng chính thức đăng nhập
            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> Register(RegisterRequest request)
        {
            // 1. Kiểm tra trùng lặp Username và Email
            var existingUsername = await _accountRepo.GetAccountByUsername(request.Username);
            if (existingUsername != null)
            {
                throw new InvalidOperationException("Username already exists");
            }

            var existingEmail = await _accountRepo.GetAccountByEmail(request.Email);
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Email already exists");
            }

            // 2. Lưu tạm thông tin đăng ký vào Cache (ví dụ: 10 phút)
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            _cache.Set($"RegisterData_{request.Email}", request, cacheOptions);

            // 3. Gửi mã OTP qua email
            await _emailService.RequestOtpAsync(request.Email);

            // 4. Báo cho Frontend biết cần chuyển sang màn hình nhập OTP
            return new AuthResponseDto
            {
                RequiresOtp = true,
                Email = request.Email
            };
        }


        public async Task<AuthResponseDto> VerifyRegisterOtp(VerifyOtpRequest request)
        {
            // 1. Kiểm tra mã OTP có hợp lệ không
            if (!_cache.TryGetValue($"OTP_{request.Email}", out string savedOtp))
            {
                throw new UnauthorizedAccessException("Mã OTP đã hết hạn hoặc không tồn tại.");
            }
            if (savedOtp != request.OtpCode)
            {
                throw new UnauthorizedAccessException("Mã OTP không chính xác.");
            }

            // 2. Lấy lại thông tin đăng ký từ Cache
            if (!_cache.TryGetValue($"RegisterData_{request.Email}", out RegisterRequest registerRequest))
            {
                throw new InvalidOperationException("Thông tin đăng ký đã quá hạn xác nhận, vui lòng đăng ký lại.");
            }

            // 3. Tạo tài khoản và lưu vào Database
            var account = new Account
            {
                Account_id = Guid.NewGuid(),
                Username = registerRequest.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
                Name = registerRequest.Name,
                Email = registerRequest.Email,
                Phone = registerRequest.Phone,
                Address = registerRequest.Address,
                Role = BusinessObject.Enums.RoleEnum.User,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                LastLogin = DateTime.UtcNow // Cập nhật lần đăng nhập đầu tiên
            };

            await _accountRepo.AddAccount(account);

            // 4. Xóa OTP và dữ liệu tạm khỏi Cache để tránh dùng lại
            _cache.Remove($"OTP_{request.Email}");
            _cache.Remove($"RegisterData_{request.Email}");

            // 5. Trả về JWT Token để người dùng đăng nhập ngay lập tức
            return GenerateAuthResponse(account);
        }

        private AuthResponseDto GenerateAuthResponse(Account account)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.Account_id.ToString()),
                new Claim(ClaimTypes.Name, account.Username),
                new Claim(ClaimTypes.Role, account.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                AccountId = account.Account_id,
                Username = account.Username,
                Role = account.Role.ToString(),
                Name = account.Name,
                Email = account.Email,
                Phone = account.Phone
            };
        }
    }
}
