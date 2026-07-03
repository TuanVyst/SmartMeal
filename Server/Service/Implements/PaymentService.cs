using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class PaymentService : IPaymentService
    {
        private readonly ISubscriptionRepo _subscriptionRepo;
        private readonly IPlanRepo _planRepo;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            ISubscriptionRepo subscriptionRepo,
            IPlanRepo planRepo,
            IConfiguration configuration,
            ILogger<PaymentService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _planRepo = planRepo;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<PaymentResponseDto> CreatePaymentLinkAsync(Guid accountId, Guid planId)
        {
            var plan = await _planRepo.GetPlanById(planId);
            if (plan == null)
                throw new InvalidOperationException("Plan not found");

            if (plan.Price <= 0)
                throw new InvalidOperationException("Free plan does not require payment");

            var clientId = _configuration["PayOS:ClientId"];
            var apiKey = _configuration["PayOS:ApiKey"];
            var checksumKey = _configuration["PayOS:ChecksumKey"];

            var payOS = new PayOSClient(clientId, apiKey, checksumKey);

            var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var amount = (int)plan.Price;
            var description = $"SMARTMEAL {plan.Name}";

            var returnUrl = _configuration["PayOS:ReturnUrl"] ?? "https://smart-meal-three.vercel.app/payment/success";
            var cancelUrl = _configuration["PayOS:CancelUrl"] ?? "https://smart-meal-three.vercel.app/payment/cancel";

            var paymentData = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = description,
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
            };

            try
            {
                var response = await payOS.PaymentRequests.CreateAsync(paymentData);

                _logger.LogInformation("PayOS payment link created: OrderCode={OrderCode}, Amount={Amount}", orderCode, amount);

                return new PaymentResponseDto
                {
                    CheckoutUrl = response.CheckoutUrl,
                    OrderCode = orderCode,
                    Amount = amount,
                    QrCode = response.QrCode,
                    PaymentLinkId = response.PaymentLinkId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create PayOS payment link");
                throw new InvalidOperationException($"Payment creation failed: {ex.Message}");
            }
        }

        public async Task HandleWebhookAsync(object webhookData)
        {
            try
            {
                var jsonString = JsonSerializer.Serialize(webhookData);
                var webhookPayload = JsonSerializer.Deserialize<JsonElement>(jsonString);

                if (!webhookPayload.TryGetProperty("success", out var successProp) || !successProp.GetBoolean())
                {
                    _logger.LogWarning("PayOS webhook indicates failure");
                    return;
                }

                if (!webhookPayload.TryGetProperty("data", out var data))
                {
                    _logger.LogWarning("PayOS webhook missing data field");
                    return;
                }

                var orderCode = data.GetProperty("orderCode").GetInt64();
                var amount = data.GetProperty("amount").GetInt32();
                var reference = data.TryGetProperty("reference", out var refProp) ? refProp.GetString() : "";

                _logger.LogInformation("PayOS webhook received: OrderCode={OrderCode}, Amount={Amount}, Ref={Reference}", orderCode, amount, reference);

                var subscriptions = await _subscriptionRepo.GetAllSubscriptions();
                var subscription = subscriptions.Find(s => s.PaymentRef == orderCode.ToString());

                if (subscription == null)
                {
                    _logger.LogWarning("No subscription found for OrderCode={OrderCode}", orderCode);
                    return;
                }

                if (subscription.Status == "active")
                {
                    _logger.LogInformation("Subscription {SubId} already active", subscription.Sub_id);
                    return;
                }

                var plan = await _planRepo.GetPlanById(subscription.Plan_id);
                if (plan == null)
                {
                    _logger.LogWarning("Plan not found for subscription {SubId}", subscription.Sub_id);
                    return;
                }

                var startDate = DateTime.UtcNow;
                DateTime? endDate = null;
                if (plan.Duration > 0)
                    endDate = startDate.AddDays(plan.Duration);

                subscription.Status = "active";
                subscription.StartDate = startDate;
                subscription.EndDate = endDate;
                subscription.PaymentRef = reference ?? orderCode.ToString();

                await _subscriptionRepo.UpdateSubscription(subscription);

                _logger.LogInformation("Subscription {SubId} activated via PayOS webhook", subscription.Sub_id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS webhook");
                throw;
            }
        }
    }
}
