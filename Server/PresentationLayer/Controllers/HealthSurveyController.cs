using BusinessObject.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/health-survey")]
    [Authorize]
    public class HealthSurveyController : ControllerBase
    {
        private readonly IHealthProfileService _healthProfileService;
        private readonly IUserConditionService _userConditionService;
        private readonly IMedicalConditionService _medicalConditionService;
        private readonly IAllergyService _allergyService;
        private readonly IAccountService _accountService;

        public HealthSurveyController(
            IHealthProfileService healthProfileService,
            IUserConditionService userConditionService,
            IMedicalConditionService medicalConditionService,
            IAllergyService allergyService,
            IAccountService accountService)
        {
            _healthProfileService = healthProfileService;
            _userConditionService = userConditionService;
            _medicalConditionService = medicalConditionService;
            _allergyService = allergyService;
            _accountService = accountService;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.Parse(claim.Value);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitSurvey([FromBody] HealthSurveyRequest request)
        {
            try
            {
                var accountId = GetAccountId();

                var profileRequest = new HealthProfileRequest
                {
                    Account_id = accountId,
                    Height = request.Height ?? 0,
                    Weight = request.Weight ?? 0,
                    Goal = request.Goal ?? "maintain",
                    DateOfBirth = request.Age.HasValue
                        ? DateTime.UtcNow.AddYears(-request.Age.Value)
                        : DateTime.UtcNow,
                    Gender = request.Gender ?? "Khác",
                    ActivityLevel = "moderate",
                };

                var existing = await _healthProfileService.GetHealthProfileByAccountId(accountId);
                HealthProfile profile;
                if (existing != null)
                {
                    profile = await _healthProfileService.UpdateHealthProfile(existing.Profile_id, profileRequest);
                }
                else
                {
                    profile = await _healthProfileService.CreateHealthProfile(profileRequest);
                }

                if (request.Conditions != null && request.Conditions.Count > 0)
                {
                    var allConditions = await _medicalConditionService.GetAllMedicalConditions();
                    foreach (var conditionName in request.Conditions)
                    {
                        var matched = allConditions.FirstOrDefault(c =>
                            c.Name != null && c.Name.Contains(conditionName, StringComparison.OrdinalIgnoreCase));
                        if (matched != null)
                        {
                            await _userConditionService.CreateUserCondition(new UserConditionRequest
                            {
                                Account_id = accountId,
                                Condition_id = matched.Condition_id,
                            });
                        }
                    }
                }

                return Ok(new { success = true, profile = new { profile.Account_id, profile.Height, profile.Weight, profile.Goal, profile.Gender, bmiLevel = CalculateBmiLevel(profile.Height, profile.Weight) } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var accountId = GetAccountId();
                var profile = await _healthProfileService.GetHealthProfileByAccountId(accountId);
                if (profile == null)
                    return NotFound(new { success = false, message = "Chưa có hồ sơ sức khoẻ" });

                return Ok(new { success = true, profile });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] HealthSurveyRequest request)
        {
            try
            {
                var accountId = GetAccountId();
                var existing = await _healthProfileService.GetHealthProfileByAccountId(accountId);
                if (existing == null)
                    return NotFound(new { success = false, message = "Chưa có hồ sơ sức khoẻ" });

                var profileRequest = new HealthProfileRequest
                {
                    Account_id = accountId,
                    Height = request.Height ?? 0,
                    Weight = request.Weight ?? 0,
                    Goal = request.Goal ?? "maintain",
                    DateOfBirth = request.Age.HasValue
                        ? DateTime.UtcNow.AddYears(-request.Age.Value)
                        : DateTime.UtcNow,
                    Gender = request.Gender ?? "Khác",
                    ActivityLevel = "moderate",
                };

                var profile = await _healthProfileService.UpdateHealthProfile(existing.Profile_id, profileRequest);

                return Ok(new { success = true, profile });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private static string CalculateBmiLevel(double? heightCm, double? weightKg)
        {
            if (heightCm == null || weightKg == null || heightCm <= 0) return "normal";
            var bmi = weightKg.Value / ((heightCm.Value / 100) * (heightCm.Value / 100));
            if (bmi < 18.5) return "underweight";
            if (bmi < 25) return "normal";
            if (bmi < 30) return "overweight";
            return "obese";
        }
    }

    public class HealthSurveyRequest
    {
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public List<string>? Conditions { get; set; }
        public List<string>? Allergies { get; set; }
        public string? Goal { get; set; }
        public string? BmiLevel { get; set; }
    }
}
