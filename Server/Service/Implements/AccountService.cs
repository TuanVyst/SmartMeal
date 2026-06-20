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

        public async Task<Account> UpdateAvatarUrl(Guid accountId, string avatarUrl)
        {
            var account = await _accountRepo.GetAccountById(accountId);
            if (account == null)
                throw new InvalidOperationException("Account not found");

            account.AvatarUrl = avatarUrl;
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

            // Tam tat OTP khi dang nhap - chi dang ky moi can OTP
            account.LastLogin = DateTime.UtcNow;
            await _accountRepo.UpdateAccount(account);

            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> VerifyOtp(VerifyOtpRequest request)
        {
            var isExist = _cache.TryGetValue($"OTP_{request.Email}", out string savedOtp);

            if (!isExist)
            {
                throw new UnauthorizedAccessException("Ma OTP da het han hoac khong ton tai.");
            }
            if (savedOtp != request.OtpCode)
            {
                throw new UnauthorizedAccessException("Ma OTP khong chinh xac.");
            }

            _cache.Remove($"OTP_{request.Email}");
            var account = await _accountRepo.GetAccountByEmail(request.Email);
            if (account == null)
            {
                throw new Exception("Tai khoan khong ton tai");
            }

            account.LastLogin = DateTime.UtcNow;
            await _accountRepo.UpdateAccount(account);

            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> Register(RegisterRequest request)
        {
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

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            _cache.Set($"RegisterData_{request.Email}", request, cacheOptions);

            await _emailService.RequestOtpAsync(request.Email);

            return new AuthResponseDto
            {
                RequiresOtp = true,
                Email = request.Email
            };
        }

        public async Task<AuthResponseDto> VerifyRegisterOtp(VerifyOtpRequest request)
        {
            if (!_cache.TryGetValue($"OTP_{request.Email}", out string savedOtp))
            {
                throw new UnauthorizedAccessException("Ma OTP da het han hoac khong ton tai.");
            }
            if (savedOtp != request.OtpCode)
            {
                throw new UnauthorizedAccessException("Ma OTP khong chinh xac.");
            }

            if (!_cache.TryGetValue($"RegisterData_{request.Email}", out RegisterRequest registerRequest))
            {
                throw new InvalidOperationException("Thong tin dang ky da qua han xac nhan, vui long dang ky lai.");
            }

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
                LastLogin = DateTime.UtcNow
            };

            await _accountRepo.AddAccount(account);

            _cache.Remove($"OTP_{request.Email}");
            _cache.Remove($"RegisterData_{request.Email}");

            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> GoogleLogin(GoogleLoginRequest request)
        {
            var clientId = _config["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException("Google login is not configured");

            Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken,
                    new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    });
            }
            catch (Exception)
            {
                throw new UnauthorizedAccessException("Invalid Google token");
            }

            var email = payload.Email;
            if (string.IsNullOrWhiteSpace(email))
                throw new UnauthorizedAccessException("Google account has no email");

            var account = await _accountRepo.GetAccountByEmail(email);

            if (account == null)
            {
                var username = email.Split('@')[0];
                var existingUsername = await _accountRepo.GetAccountByUsername(username);
                if (existingUsername != null)
                    username += new Random().Next(1000, 9999);

                account = new Account
                {
                    Account_id = Guid.NewGuid(),
                    Username = username,
                    Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Name = payload.Name ?? username,
                    Email = email,
                    Role = BusinessObject.Enums.RoleEnum.User,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    LastLogin = DateTime.UtcNow
                };

                await _accountRepo.AddAccount(account);
            }
            else
            {
                if (!account.IsActive)
                    throw new UnauthorizedAccessException("Account is disabled");

                account.LastLogin = DateTime.UtcNow;
                await _accountRepo.UpdateAccount(account);
            }

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
