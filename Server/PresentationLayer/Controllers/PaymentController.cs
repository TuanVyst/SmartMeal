using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPaymentService paymentService,
            ISubscriptionService subscriptionService,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequest request)
        {
            try
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim == null)
                    return Unauthorized(new { success = false, message = "Account ID not found" });

                var jwtAccountId = Guid.Parse(claim.Value);
                if (request.Account_id != Guid.Empty && request.Account_id != jwtAccountId)
                    return Forbid();

                request.Account_id = jwtAccountId;

                var paymentResponse = await _paymentService.CreatePaymentLinkAsync(request.Account_id, request.Plan_id);

                var now = DateTime.UtcNow;
                var subscriptionRequest = new BusinessObject.Dtos.RequestModels.SubscriptionRequest
                {
                    Account_id = request.Account_id,
                    Plan_id = request.Plan_id,
                    StartDate = now,
                    Status = "pending",
                    PaymentRef = paymentResponse.OrderCode.ToString()
                };

                var subscription = await _subscriptionService.CreateSubscription(subscriptionRequest);

                _logger.LogInformation("Payment link created for account {AccountId}, plan {PlanId}, orderCode {OrderCode}",
                    request.Account_id, request.Plan_id, paymentResponse.OrderCode);

                return Ok(new { success = true, data = paymentResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment link");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        [HttpPut("webhook")]
        [HttpGet("webhook")]
        [HttpOptions("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook([FromBody] object payload)
        {
            if (Request.Method == "OPTIONS")
                return Ok();

            if (Request.Method == "GET")
                return Ok(new { code = "00", desc = "success", success = true });

            try
            {
                _logger.LogInformation("PayOS webhook received");

                await _paymentService.HandleWebhookAsync(payload);

                return Ok(new { code = "00", desc = "success", success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS webhook");
                return Ok(new { code = "00", desc = "success", success = true });
            }
        }

        [HttpGet("check-status/{orderCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckStatus(long orderCode)
        {
            try
            {
                var isPaid = await _paymentService.CheckPaymentStatusAsync(orderCode);
                return Ok(new { success = true, isPaid });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking payment status for orderCode: {OrderCode}", orderCode);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("return")]
        [AllowAnonymous]
        public IActionResult Return([FromQuery] string id, [FromQuery] string orderCode, [FromQuery] string cancel)
        {
            var frontendUrl = "https://smart-meal-three.vercel.app";

            if (!string.IsNullOrEmpty(cancel) && cancel == "true")
            {
                return Redirect($"{frontendUrl}/payment/cancel");
            }

            return Redirect($"{frontendUrl}/payment/success?orderCode={orderCode}");
        }
    }
}
