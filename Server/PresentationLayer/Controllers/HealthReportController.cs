using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HealthReportController : ControllerBase
    {
        private readonly IHealthReportService _healthReportService;

        public HealthReportController(IHealthReportService healthReportService)
        {
            _healthReportService = healthReportService;
        }

        [HttpGet]
        public async Task<IActionResult> GetHealthReport()
        {
            try
            {
                var accountIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(accountIdClaim) || !Guid.TryParse(accountIdClaim, out var accountId))
                {
                    return Unauthorized("Invalid token.");
                }

                var report = await _healthReportService.GetHealthReportAsync(accountId);
                return Ok(new { data = report });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
