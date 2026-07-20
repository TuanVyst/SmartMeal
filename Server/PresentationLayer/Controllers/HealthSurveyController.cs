using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Service.Interfaces;
using System.Security.Claims;
using BusinessObject.Helpers;

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
        private readonly IBmiLogService _bmiLogService;
        private readonly AppDbContext _ctx;

        public HealthSurveyController(
            IHealthProfileService healthProfileService,
            IUserConditionService userConditionService,
            IMedicalConditionService medicalConditionService,
            IAllergyService allergyService,
            IAccountService accountService,
            IBmiLogService bmiLogService,
            AppDbContext ctx)
        {
            _healthProfileService = healthProfileService;
            _userConditionService = userConditionService;
            _medicalConditionService = medicalConditionService;
            _allergyService = allergyService;
            _accountService = accountService;
            _bmiLogService = bmiLogService;
            _ctx = ctx;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.Parse(claim.Value);
        }

        // Frontend key -> search keyword used to match DB record name
        private static readonly Dictionary<string, string> ConditionKeywordMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "diabetes",     "tiểu đường" },
            { "hypertension", "huyết áp" },
            { "cholesterol",  "cholesterol" },
            { "heartDisease", "tim mạch" },
            { "gerd",         "dạ dày" },
            { "gout",         "gout" },
        };

        private async Task<List<string>> GetUserConditionNames(Guid accountId)
        {
            var dbNames = await _ctx.UserConditions
                .Where(uc => uc.Account_id == accountId && !uc.IsDeleted)
                .Join(_ctx.MedicalConditions,
                    uc => uc.Condition_id,
                    mc => mc.Condition_id,
                    (uc, mc) => mc.Name)
                .Where(name => name != null)
                .ToListAsync();

            // Map DB names back to frontend keys
            var keys = new List<string>();
            foreach (var name in dbNames)
            {
                var lowerName = name.ToLower();
                foreach (var kvp in ConditionKeywordMap)
                {
                    if (lowerName.Contains(kvp.Value.ToLower()))
                    {
                        if (!keys.Contains(kvp.Key))
                            keys.Add(kvp.Key);
                        break;
                    }
                }
            }
            return keys;
        }

        private async Task<List<string>> GetUserAllergyNames(Guid accountId)
        {
            return await _ctx.Allergies
                .Where(a => a.Account_id == accountId && !a.IsDeleted)
                .Join(_ctx.Ingredients,
                    a => a.Ingredient_id,
                    i => i.Ingredient_id,
                    (a, i) => i.Name)
                .Where(name => name != null)
                .ToListAsync();
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
                    TargetWeight = request.TargetWeight,
                    TargetWeeks = request.TargetWeeks ?? 12,
                    Goal = request.Goal ?? "maintain",
                    DateOfBirth = request.Age.HasValue
                        ? DateTime.UtcNow.AddYears(-request.Age.Value)
                        : DateTime.UtcNow,
                    Gender = request.Gender ?? "Khác",
                    ActivityLevel = request.ActivityLevel ?? "sedentary",
                    CookingTimeMinutes = request.CookingTimeMinutes,
                    BudgetLevel = request.BudgetLevel,
                    MealsPerDay = request.MealsPerDay,
                    DietType = request.DietType,
                    PlanCycleDays = request.PlanCycleDays,
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
                    foreach (var conditionKey in request.Conditions)
                    {
                        var searchKeyword = ConditionKeywordMap.TryGetValue(conditionKey, out var kw) ? kw : conditionKey;
                        var matched = allConditions.FirstOrDefault(c =>
                            c.Name != null && c.Name.Contains(searchKeyword, StringComparison.OrdinalIgnoreCase));
                            
                        if (matched == null)
                        {
                            string dbName = conditionKey switch
                            {
                                "diabetes" => "Tiểu đường type 2",
                                "hypertension" => "Huyết áp cao",
                                "cholesterol" => "Cholesterol cao",
                                "heartDisease" => "Bệnh tim mạch",
                                "gerd" => "Dạ dày / Trào ngược axit",
                                "gout" => "Gout",
                                _ => conditionKey
                            };
                            
                            matched = new MedicalCondition 
                            { 
                                Condition_id = Guid.NewGuid(), 
                                Name = dbName, 
                                Category = "Bệnh lý nền" 
                            };
                            _ctx.MedicalConditions.Add(matched);
                            await _ctx.SaveChangesAsync();
                            allConditions.Add(matched);
                        }

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

                if (request.Height > 0 && request.Weight > 0)
                {
                    await _bmiLogService.CreateBmiLog(accountId, request.Height.Value, request.Weight.Value);
                }

                var conditionNames = await GetUserConditionNames(accountId);
                var allergyNames = await GetUserAllergyNames(accountId);

                var targets = HealthRulesHelper.CalculateDailyTargets(profile, conditionNames);
                var existingGoal = await _ctx.NutritionGoals.FirstOrDefaultAsync(g => g.Account_id == accountId && !g.IsDeleted);
                if (existingGoal != null)
                {
                    existingGoal.TargetCalories = targets.Calories;
                    existingGoal.TargetProtein = targets.Protein;
                    existingGoal.TargetCarbs = targets.Carbs;
                    existingGoal.TargetFat = targets.Fat;
                    existingGoal.TargetFiber = targets.Fiber;
                    existingGoal.TargetSugar = targets.SugarLimit;
                    existingGoal.TargetSalt = targets.SaltLimit;
                    _ctx.NutritionGoals.Update(existingGoal);
                }
                else
                {
                    _ctx.NutritionGoals.Add(new NutritionGoal
                    {
                        Account_id = accountId,
                        TargetCalories = targets.Calories,
                        TargetProtein = targets.Protein,
                        TargetCarbs = targets.Carbs,
                        TargetFat = targets.Fat,
                        TargetFiber = targets.Fiber,
                        TargetSugar = targets.SugarLimit,
                        TargetSalt = targets.SaltLimit
                    });
                }
                await _ctx.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    profile = new
                    {
                        profile.Account_id,
                        profile.Height,
                        profile.Weight,
                        profile.TargetWeight,
                        profile.TargetWeeks,
                        profile.Goal,
                        profile.Gender,
                        profile.DateOfBirth,
                        profile.ActivityLevel,
                        bmiLevel = CalculateBmiLevel(profile.Height, profile.Weight),
                        conditions = conditionNames,
                        allergies = allergyNames,
                        cookingTimeMinutes = profile.CookingTimeMinutes,
                        budgetLevel = profile.BudgetLevel,
                        mealsPerDay = profile.MealsPerDay,
                        dietType = profile.DietType,
                        planCycleDays = profile.PlanCycleDays,
                        dailyTargets = new
                        {
                            calories = targets.Calories,
                            protein = targets.Protein,
                            carbs = targets.Carbs,
                            fat = targets.Fat,
                            fiber = targets.Fiber,
                            sugarLimit = targets.SugarLimit,
                            saltLimit = targets.SaltLimit
                        }
                    }
                });
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

                var conditionNames = await GetUserConditionNames(accountId);
                var allergyNames = await GetUserAllergyNames(accountId);

                var targets = HealthRulesHelper.CalculateDailyTargets(profile, conditionNames);

                return Ok(new
                {
                    success = true,
                    profile = new
                    {
                        profile.Account_id,
                        profile.Height,
                        profile.Weight,
                        profile.TargetWeight,
                        profile.TargetWeeks,
                        profile.Goal,
                        profile.Gender,
                        profile.DateOfBirth,
                        profile.ActivityLevel,
                        bmiLevel = CalculateBmiLevel(profile.Height, profile.Weight),
                        conditions = conditionNames,
                        allergies = allergyNames,
                        cookingTimeMinutes = profile.CookingTimeMinutes,
                        budgetLevel = profile.BudgetLevel,
                        mealsPerDay = profile.MealsPerDay,
                        dietType = profile.DietType,
                        planCycleDays = profile.PlanCycleDays,
                        dailyTargets = new
                        {
                            calories = targets.Calories,
                            protein = targets.Protein,
                            carbs = targets.Carbs,
                            fat = targets.Fat,
                            fiber = targets.Fiber,
                            sugarLimit = targets.SugarLimit,
                            saltLimit = targets.SaltLimit
                        }
                    }
                });
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
                    Height = request.Height ?? existing.Height ?? 0,
                    Weight = request.Weight ?? existing.Weight ?? 0,
                    TargetWeight = request.TargetWeight,
                    TargetWeeks = request.TargetWeeks,
                    Goal = request.Goal ?? existing.Goal ?? "maintain",
                    DateOfBirth = request.Age.HasValue
                        ? DateTime.UtcNow.AddYears(-request.Age.Value)
                        : existing.DateOfBirth ?? DateTime.UtcNow,
                    Gender = request.Gender ?? existing.Gender ?? "Khác",
                    ActivityLevel = request.ActivityLevel ?? existing.ActivityLevel ?? "sedentary",
                    CookingTimeMinutes = request.CookingTimeMinutes ?? existing.CookingTimeMinutes,
                    BudgetLevel = request.BudgetLevel ?? existing.BudgetLevel,
                    MealsPerDay = request.MealsPerDay ?? existing.MealsPerDay,
                    DietType = request.DietType ?? existing.DietType,
                    PlanCycleDays = request.PlanCycleDays ?? existing.PlanCycleDays,
                };

                var profile = await _healthProfileService.UpdateHealthProfile(existing.Profile_id, profileRequest);

                var allConditions = await _medicalConditionService.GetAllMedicalConditions();
                var existingUserConditions = await _ctx.UserConditions
                    .Where(uc => uc.Account_id == accountId && !uc.IsDeleted)
                    .ToListAsync();
                foreach (var uc in existingUserConditions)
                {
                    uc.IsDeleted = true;
                    _ctx.UserConditions.Update(uc);
                }
                await _ctx.SaveChangesAsync();

                if (request.Conditions != null && request.Conditions.Count > 0)
                {
                    foreach (var conditionKey in request.Conditions)
                    {
                        var searchKeyword = ConditionKeywordMap.TryGetValue(conditionKey, out var kw2) ? kw2 : conditionKey;
                        var matched = allConditions.FirstOrDefault(c =>
                            c.Name != null && c.Name.Contains(searchKeyword, StringComparison.OrdinalIgnoreCase));
                            
                        if (matched == null)
                        {
                            string dbName = conditionKey switch
                            {
                                "diabetes" => "Tiểu đường type 2",
                                "hypertension" => "Huyết áp cao",
                                "cholesterol" => "Cholesterol cao",
                                "heartDisease" => "Bệnh tim mạch",
                                "gerd" => "Dạ dày / Trào ngược axit",
                                "gout" => "Gout",
                                _ => conditionKey
                            };
                            
                            matched = new MedicalCondition 
                            { 
                                Condition_id = Guid.NewGuid(), 
                                Name = dbName, 
                                Category = "Bệnh lý nền" 
                            };
                            _ctx.MedicalConditions.Add(matched);
                            await _ctx.SaveChangesAsync();
                            allConditions.Add(matched);
                        }

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

                var existingAllergies = await _ctx.Allergies
                    .Where(a => a.Account_id == accountId && !a.IsDeleted)
                    .ToListAsync();
                foreach (var a in existingAllergies)
                {
                    a.IsDeleted = true;
                    _ctx.Allergies.Update(a);
                }
                await _ctx.SaveChangesAsync();

                if (request.Allergies != null && request.Allergies.Count > 0)
                {
                    var allIngredients = await _ctx.Ingredients.ToListAsync();
                    foreach (var allergyName in request.Allergies)
                    {
                        var matchedIngredient = allIngredients.FirstOrDefault(i =>
                            i.Name != null && i.Name.Contains(allergyName, StringComparison.OrdinalIgnoreCase));
                        if (matchedIngredient != null)
                        {
                            _ctx.Allergies.Add(new Allergy
                            {
                                Allergy_id = Guid.NewGuid(),
                                Account_id = accountId,
                                Ingredient_id = matchedIngredient.Ingredient_id,
                                IsDeleted = false
                            });
                        }
                    }
                    await _ctx.SaveChangesAsync();
                }

                if (request.Height > 0 && request.Weight > 0)
                {
                    var oldHeight = existing.Height ?? 0;
                    var oldWeight = existing.Weight ?? 0;
                    var oldBmi = oldHeight > 0
                        ? oldWeight / ((oldHeight / 100) * (oldHeight / 100))
                        : 0;
                    var newBmi = request.Weight.Value / ((request.Height.Value / 100) * (request.Height.Value / 100));
                    if (Math.Abs(oldBmi - newBmi) > 0.1 || existing.Height != request.Height || existing.Weight != request.Weight)
                    {
                        await _bmiLogService.CreateBmiLog(accountId, request.Height.Value, request.Weight.Value);
                    }
                }

                var conditionNames = await GetUserConditionNames(accountId);
                var allergyNames = await GetUserAllergyNames(accountId);

                var targets = HealthRulesHelper.CalculateDailyTargets(profile, conditionNames);
                var existingGoal = await _ctx.NutritionGoals.FirstOrDefaultAsync(g => g.Account_id == accountId && !g.IsDeleted);
                if (existingGoal != null)
                {
                    existingGoal.TargetCalories = targets.Calories;
                    existingGoal.TargetProtein = targets.Protein;
                    existingGoal.TargetCarbs = targets.Carbs;
                    existingGoal.TargetFat = targets.Fat;
                    existingGoal.TargetFiber = targets.Fiber;
                    existingGoal.TargetSugar = targets.SugarLimit;
                    existingGoal.TargetSalt = targets.SaltLimit;
                    _ctx.NutritionGoals.Update(existingGoal);
                }
                else
                {
                    _ctx.NutritionGoals.Add(new NutritionGoal
                    {
                        Account_id = accountId,
                        TargetCalories = targets.Calories,
                        TargetProtein = targets.Protein,
                        TargetCarbs = targets.Carbs,
                        TargetFat = targets.Fat,
                        TargetFiber = targets.Fiber,
                        TargetSugar = targets.SugarLimit,
                        TargetSalt = targets.SaltLimit
                    });
                }
                await _ctx.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    profile = new
                    {
                        profile.Account_id,
                        profile.Height,
                        profile.Weight,
                        profile.TargetWeight,
                        profile.TargetWeeks,
                        profile.Goal,
                        profile.Gender,
                        profile.DateOfBirth,
                        profile.ActivityLevel,
                        bmiLevel = CalculateBmiLevel(profile.Height, profile.Weight),
                        conditions = conditionNames,
                        allergies = allergyNames,
                        cookingTimeMinutes = profile.CookingTimeMinutes,
                        budgetLevel = profile.BudgetLevel,
                        mealsPerDay = profile.MealsPerDay,
                        dietType = profile.DietType,
                        planCycleDays = profile.PlanCycleDays,
                        dailyTargets = new
                        {
                            calories = targets.Calories,
                            protein = targets.Protein,
                            carbs = targets.Carbs,
                            fat = targets.Fat,
                            fiber = targets.Fiber,
                            sugarLimit = targets.SugarLimit,
                            saltLimit = targets.SaltLimit
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("bmi-history")]
        public async Task<IActionResult> GetBmiHistory()
        {
            try
            {
                var accountId = GetAccountId();
                var logs = await _bmiLogService.GetBmiLogsByAccountId(accountId);
                return Ok(new
                {
                    success = true,
                    data = logs.Select(l => new
                    {
                        l.Log_id,
                        l.Height,
                        l.Weight,
                        l.Bmi,
                        l.BmiLevel,
                        l.RecordedAt
                    })
                });
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
        public double? TargetWeight { get; set; }
        public int? TargetWeeks { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public List<string>? Conditions { get; set; }
        public List<string>? Allergies { get; set; }
        public string? Goal { get; set; }
        public string? BmiLevel { get; set; }
        public string? ActivityLevel { get; set; }
        public int? CookingTimeMinutes { get; set; }
        public string? BudgetLevel { get; set; }
        public int? MealsPerDay { get; set; }
        public string? DietType { get; set; }
        public int? PlanCycleDays { get; set; }
    }
}
