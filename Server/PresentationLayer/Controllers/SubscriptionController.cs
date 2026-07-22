using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(ISubscriptionService subscriptionService, ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Account ID not found in token");
            return Guid.Parse(claim.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? accountId = null)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                var targetAccountId = accountId ?? jwtAccountId;
                if (targetAccountId != jwtAccountId)
                    return Forbid();

                var items = await _subscriptionService.GetSubscriptionsByAccountId(targetAccountId);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all subscriptions");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                var item = await _subscriptionService.GetSubscriptionById(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Subscription not found" });

                if (item.Account_id != jwtAccountId)
                    return Forbid();

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription by id");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubscriptionRequest request)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                request.Account_id = jwtAccountId;

                var item = await _subscriptionService.CreateSubscription(request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SubscriptionRequest request)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                var existing = await _subscriptionService.GetSubscriptionById(id);
                if (existing == null)
                    return NotFound(new { success = false, message = "Subscription not found" });

                if (existing.Account_id != jwtAccountId)
                    return Forbid();

                request.Account_id = jwtAccountId;

                var item = await _subscriptionService.UpdateSubscription(id, request);
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                var existing = await _subscriptionService.GetSubscriptionById(id);
                if (existing == null)
                    return NotFound(new { success = false, message = "Subscription not found" });

                if (existing.Account_id != jwtAccountId)
                    return Forbid();

                var item = await _subscriptionService.SoftDeleteSubscription(id);
                return Ok(new { success = true, message = "Subscription deleted successfully", data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting subscription");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("check-feature")]
        public async Task<IActionResult> CheckFeature([FromQuery] string featureKey)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                if (string.IsNullOrEmpty(featureKey)) return BadRequest(new { message = "featureKey is required" });

                bool hasFeature = await _subscriptionService.HasFeatureAsync(jwtAccountId, featureKey);
                return Ok(new { success = true, data = hasFeature });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking feature");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
