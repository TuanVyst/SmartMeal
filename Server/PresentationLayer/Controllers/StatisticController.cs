using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StatisticController : ControllerBase
    {
        private readonly IStatisticService _statisticService;
        private readonly ILogger<StatisticController> _logger;

        public StatisticController(IStatisticService statisticService, ILogger<StatisticController> logger)
        {
            _statisticService = statisticService;
            _logger = logger;
        }

        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetSubscriptionStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var data = await _statisticService.GetSubscriptionStatisticsAsync(startDate, endDate);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription statistics");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
