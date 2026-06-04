using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
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
        private readonly IAccountRepo _repo;
        private readonly IConfiguration _config;

        public AccountService(IAccountRepo repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        public async Task<Account> AddAccount(Account account)
        {
            return await _repo.AddAccount(account);
        }

        public async Task DeleteAccount(Guid id)
        {
            await _repo.DeleteAccount(id);
        }

        public async Task<Account> GetAccountById(Guid id)
        {
            return await _repo.GetAccountById(id);
        }

        public async Task<List<Account>> GetAllAccounts()
        {
            return await _repo.GetAllAccounts();
        }

        public async Task<Account> UpdateAccount(Account account)
        {
            return await _repo.UpdateAccount(account);
        }

        public async Task<AuthResponseDto> Login(LoginRequest request)
        {
            var account = await _repo.GetAccountByUsername(request.EmailOrUsername)
                         ?? await _repo.GetAccountByEmail(request.EmailOrUsername);
            if (account == null || !BCrypt.Net.BCrypt.Verify(request.Password, account.Password))
            {
                throw new UnauthorizedAccessException("Invalid username/email or password");
            }

            if (!account.IsActive)
            {
                throw new UnauthorizedAccessException("Account is disabled");
            }

            account.LastLogin = DateTime.UtcNow;
            await _repo.UpdateAccount(account);

            return GenerateAuthResponse(account);
        }

        public async Task<AuthResponseDto> Register(RegisterRequest request)
        {
            var existingUsername = await _repo.GetAccountByUsername(request.Username);
            if (existingUsername != null)
            {
                throw new InvalidOperationException("Username already exists");
            }

            var existingEmail = await _repo.GetAccountByEmail(request.Email);
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Email already exists");
            }

            var account = new Account
            {
                Account_id = Guid.NewGuid(),
                Username = request.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address,
                Role = BusinessObject.Enums.RoleEnum.User,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _repo.AddAccount(account);
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
