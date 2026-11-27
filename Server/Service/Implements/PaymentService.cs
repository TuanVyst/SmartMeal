using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using BusinessObject.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using Repository.Interfaces;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class PaymentService : IPaymentService
    {
        private readonly ISubscriptionRepo _subscriptionRepo;
        private readonly IPlanRepo _planRepo;
        private readonly IPromotionRepo _promotionRepo;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

        /// <summary>Vietnam launch date: only transactions from this date onwards are real payments.</summary>
        private static readonly DateTime PayOsSyncDefaultFromVn = new DateTime(2026, 11, 19);

        /// <summary>Delay between PayOS calls to stay friendly with provider rate limits.</summary>
        private const int PayOsCallDelayMs = 250;

        private static readonly JsonSerializerOptions EvidenceJsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = { new JsonStringEnumConverter() }
        };

        public PaymentService(
            ISubscriptionRepo subscriptionRepo,
            IPlanRepo planRepo,
            IPromotionRepo promotionRepo,
            IConfiguration configuration,
            ILogger<PaymentService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _planRepo = planRepo;
            _promotionRepo = promotionRepo;
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

            var payOS = CreatePayOsClient();

            var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // Price is resolved server-side so the advertised sale price and the charged
            // amount can never diverge.
            var nowUtc = DateTime.UtcNow;
            var promotions = await _promotionRepo.GetActiveByPlanIdsAsync(new List<Guid> { planId }, nowUtc);
            var promotion = promotions.GetValueOrDefault(planId);
            var effectivePrice = PlanPricingHelper.ResolveEffectivePrice(plan.Price, promotion, nowUtc);
            var amount = (int)Math.Round(effectivePrice, MidpointRounding.AwayFromZero);
            var appliedPromotion = amount < plan.Price ? promotion : null;
            var description = orderCode.ToString();

            // Prefer configuration key PayOS:ReturnUrl (or environment key PayOS__ReturnUrl),
            // fall back to legacy PAYOS_RETURN_URL env var, then to the production default.
            var returnUrl = _configuration["PayOS:ReturnUrl"] ?? _configuration["PAYOS_RETURN_URL"] ?? "https://smart-meal-orcin.vercel.app/payment/success";
            var cancelUrl = _configuration["PayOS:CancelUrl"] ?? _configuration["PAYOS_CANCEL_URL"] ?? "https://smart-meal-orcin.vercel.app/payment/cancel";

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
                _logger.LogInformation("PayOS response: CheckoutUrl={CheckoutUrl}, QrCode length={QrCodeLen}, PaymentLinkId={PaymentLinkId}",
                    response.CheckoutUrl, response.QrCode?.Length ?? 0, response.PaymentLinkId);

                return new PaymentResponseDto
                {
                    CheckoutUrl = response.CheckoutUrl,
                    OrderCode = orderCode,
                    Amount = amount,
                    OriginalAmount = (int)Math.Round(plan.Price, MidpointRounding.AwayFromZero),
                    DiscountPercent = appliedPromotion?.DiscountPercent ?? 0,
                    PromotionId = appliedPromotion?.Promo_id,
                    QrCode = response.QrCode,
                    PaymentLinkId = response.PaymentLinkId,
                    TransferContent = ExtractPurposeOfTransaction(response.QrCode)
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
                var json = JsonSerializer.Deserialize<JsonElement>(jsonString);

                if (!json.TryGetProperty("code", out var codeProp) || codeProp.GetString() != "00")
                {
                    _logger.LogWarning("PayOS webhook indicates failure");
                    return;
                }

                if (!json.TryGetProperty("data", out var data))
                {
                    _logger.LogWarning("PayOS webhook missing data field");
                    return;
                }

                if (!data.TryGetProperty("orderCode", out var orderCodeProp))
                {
                    _logger.LogWarning("PayOS webhook missing orderCode");
                    return;
                }

                var orderCode = orderCodeProp.GetInt64();
                var amount = ReadLong(data, "amount") ?? 0;

                _logger.LogInformation("PayOS webhook received: OrderCode={OrderCode}, Amount={Amount}", orderCode, amount);

                var subscription = await _subscriptionRepo.GetByPaymentRefAsync(orderCode.ToString(CultureInfo.InvariantCulture));

                if (subscription == null)
                {
                    _logger.LogWarning("No subscription found for OrderCode={OrderCode}", orderCode);
                    return;
                }

                // ---- evidence capture (idempotent: also fills evidence for already-active rows) ----
                var paymentLinkId = ReadString(data, "paymentLinkId");
                var reference = ReadString(data, "reference");
                var description = ReadString(data, "description");
                var transactionDateTime = ReadString(data, "transactionDateTime");
                var paidAt = PaymentEvidenceHelper.ParsePayOsTime(transactionDateTime);

                if (data.TryGetProperty("transactions", out var transactions) && transactions.ValueKind == JsonValueKind.Array)
                {
                    foreach (var tx in transactions.EnumerateArray())
                    {
                        var txRef = ReadString(tx, "reference");
                        var txDesc = ReadString(tx, "description");
                        var txTime = ReadString(tx, "transactionDateTime");

                        if (string.IsNullOrWhiteSpace(reference) && !string.IsNullOrWhiteSpace(txRef))
                            reference = txRef;
                        if (string.IsNullOrWhiteSpace(description) && !string.IsNullOrWhiteSpace(txDesc))
                            description = txDesc;
                        if (!paidAt.HasValue && !string.IsNullOrWhiteSpace(txTime))
                            paidAt = PaymentEvidenceHelper.ParsePayOsTime(txTime);

                        if (!string.IsNullOrWhiteSpace(reference) && paidAt.HasValue)
                            break;
                    }
                }

                subscription.PaymentProvider = "PayOS";
                subscription.ProviderStatus = "PAID";
                if (amount > 0) subscription.PricePaid = amount;
                if (!string.IsNullOrWhiteSpace(paymentLinkId)) subscription.PaymentLinkId = paymentLinkId;
                if (!string.IsNullOrWhiteSpace(reference)) subscription.BankReference = reference;
                if (!string.IsNullOrWhiteSpace(description)) subscription.PaymentDescription = description;
                subscription.PaidAt = paidAt ?? subscription.PaidAt ?? DateTime.UtcNow;
                subscription.RawEvidence = jsonString;
                subscription.EvidenceSource = "webhook";
                subscription.EvidenceSyncedAt = DateTime.UtcNow;

                if (!string.Equals(subscription.Status, "active", StringComparison.OrdinalIgnoreCase))
                {
                    await ActivateSubscriptionAsync(subscription, subscription.PaidAt);
                }
                else
                {
                    await _subscriptionRepo.UpdateSubscription(subscription);
                }

                _logger.LogInformation("Subscription {SubId} processed via PayOS webhook", subscription.Sub_id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS webhook");
                throw;
            }
        }

        public async Task<bool> CheckPaymentStatusAsync(long orderCode)
        {
            try
            {
                var payOS = CreatePayOsClient();
                var paymentInfo = await payOS.PaymentRequests.GetAsync(orderCode);
                var providerStatus = NormalizeStatus(paymentInfo.Status);

                var subscription = await _subscriptionRepo.GetByPaymentRefAsync(orderCode.ToString(CultureInfo.InvariantCulture));

                if (subscription == null)
                {
                    _logger.LogWarning("No subscription found for OrderCode={OrderCode}", orderCode);
                    return providerStatus == "PAID";
                }

                if (providerStatus == "CANCELLED" || providerStatus == "EXPIRED" || providerStatus == "FAILED")
                {
                    ApplyPaymentLinkEvidence(subscription, paymentInfo, "poll");
                    if (string.Equals(subscription.Status, "pending", StringComparison.OrdinalIgnoreCase))
                    {
                        subscription.Status = MapPayOsStatusToDb(paymentInfo.Status);
                    }
                    await _subscriptionRepo.UpdateSubscription(subscription);
                    return false;
                }

                if (providerStatus != "PAID")
                {
                    // Still pending / processing: persist the (partial) evidence for reconciliation.
                    if (string.Equals(subscription.Status, "pending", StringComparison.OrdinalIgnoreCase))
                    {
                        ApplyPaymentLinkEvidence(subscription, paymentInfo, "poll");
                        await _subscriptionRepo.UpdateSubscription(subscription);
                    }
                    return false;
                }

                // PAID
                var alreadyActive = string.Equals(subscription.Status, "active", StringComparison.OrdinalIgnoreCase);
                ApplyPaymentLinkEvidence(subscription, paymentInfo, "poll");

                if (!alreadyActive)
                {
                    await ActivateSubscriptionAsync(subscription, subscription.PaidAt);
                }
                else
                {
                    await _subscriptionRepo.UpdateSubscription(subscription);
                }

                _logger.LogInformation("Subscription {SubId} processed via polling CheckPaymentStatusAsync", subscription.Sub_id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to check payment status for orderCode: {OrderCode}", orderCode);
                return false;
            }
        }

        public async Task<bool> CancelPaymentAsync(long orderCode)
        {
            try
            {
                var subscription = await _subscriptionRepo.GetByPaymentRefAsync(orderCode.ToString(CultureInfo.InvariantCulture));

                if (subscription != null && string.Equals(subscription.Status, "pending", StringComparison.OrdinalIgnoreCase))
                {
                    subscription.Status = "cancelled";
                    subscription.ProviderStatus = "CANCELLED";
                    subscription.EvidenceSyncedAt = DateTime.UtcNow;
                    await _subscriptionRepo.UpdateSubscription(subscription);
                    _logger.LogInformation("Subscription {SubId} cancelled for OrderCode {OrderCode}", subscription.Sub_id, orderCode);
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cancel payment for orderCode: {OrderCode}", orderCode);
                return false;
            }
        }

        // ------------------------------------------------------------------
        // PayOS verification & evidence sync
        // ------------------------------------------------------------------

        public async Task<PayOsVerificationDto> VerifyPaymentLinkAsync(long orderCode)
        {
            PayOSClient payOS;
            try
            {
                payOS = CreatePayOsClient();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Cấu hình PayOS không hợp lệ: {ex.Message}", ex);
            }

            try
            {
                var link = await payOS.PaymentRequests.GetAsync(orderCode);

                return new PayOsVerificationDto
                {
                    Available = true,
                    Status = NormalizeStatus(link.Status),
                    Amount = link.Amount,
                    AmountPaid = link.AmountPaid,
                    AmountRemaining = link.AmountRemaining,
                    CreatedAt = PaymentEvidenceHelper.ParsePayOsTime(link.CreatedAt),
                    CanceledAt = PaymentEvidenceHelper.ParsePayOsTime(link.CanceledAt),
                    CancellationReason = link.CancellationReason,
                    Transactions = (link.Transactions ?? new List<PaymentTransaction>())
                        .Select(t => new PayOsVerificationTransactionDto
                        {
                            Reference = t.Reference,
                            Amount = t.Amount,
                            AccountNumber = t.AccountNumber,
                            Description = t.Description,
                            TransactionDateTime = t.TransactionDateTime,
                            VirtualAccountName = t.VirtualAccountName,
                            VirtualAccountNumber = t.VirtualAccountNumber,
                            CounterAccountBankId = t.CounterAccountBankId,
                            CounterAccountBankName = t.CounterAccountBankName,
                            CounterAccountName = t.CounterAccountName,
                            CounterAccountNumber = t.CounterAccountNumber
                        })
                        .ToList(),
                    FetchedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to verify PayOS payment link {OrderCode}", orderCode);
                throw new InvalidOperationException(
                    $"Không thể lấy dữ liệu từ PayOS cho đơn {orderCode}: {ex.Message}", ex);
            }
        }

        public async Task<PayOsSyncResultDto> SyncPayOsEvidenceAsync(PayOsSyncRequest request)
        {
            request ??= new PayOsSyncRequest();

            var requestedFromVn = (request.FromDate?.Date) ?? PayOsSyncDefaultFromVn;
            var todayVn = DateTime.UtcNow.AddHours(7).Date;
            var toVn = request.ToDate?.Date ?? todayVn;
            if (toVn < requestedFromVn)
            {
                (requestedFromVn, toVn) = (toVn, requestedFromVn);
            }

            // Hard floor: rows created before launch are test data and must never be synced,
            // even when a caller explicitly asks for an earlier window.
            var fromVn = requestedFromVn < PayOsSyncDefaultFromVn
                ? PayOsSyncDefaultFromVn
                : requestedFromVn;

            var fromUtc = PaymentEvidenceHelper.ToVnStartUtc(fromVn);
            var toUtcExclusive = PaymentEvidenceHelper.ToVnEndUtcExclusive(toVn);

            var limit = request.Limit < 1 ? 1 : request.Limit;
            if (limit > 100) limit = 100;
            var offset = request.Offset < 0 ? 0 : request.Offset;

            var result = new PayOsSyncResultDto
            {
                DryRun = request.DryRun,
                FromDate = fromVn,
                ToDate = toVn
            };

            if (toVn < fromVn)
            {
                _logger.LogInformation(
                    "PayOS evidence sync: requested window ends before the launch date {Launch}; nothing to sync",
                    PayOsSyncDefaultFromVn);
                return result;
            }

            var candidates = await _subscriptionRepo.GetSubscriptionsForPayOsSyncAsync(
                fromUtc,
                toUtcExclusive,
                request.Statuses,
                request.SubIds,
                limit,
                offset,
                skipFullEvidence: !request.Force);

            if (candidates.Count == 0)
            {
                _logger.LogInformation("PayOS evidence sync: no candidates between {From} and {To}", fromVn, toVn);
                return result;
            }

            var payOS = CreatePayOsClient();

            for (var i = 0; i < candidates.Count; i++)
            {
                if (i > 0)
                    await Task.Delay(PayOsCallDelayMs);

                var sub = candidates[i];
                var orderCodeText = sub.PaymentRef;
                var item = new PayOsSyncItemDto
                {
                    SubId = sub.Sub_id,
                    OrderCode = orderCodeText,
                    DbStatus = sub.Status,
                    DbAmount = sub.PricePaid
                };

                try
                {
                    if (!long.TryParse(orderCodeText, out var orderCode))
                    {
                        item.Action = "skipped";
                        item.Note = "PaymentRef không phải mã đơn PayOS hợp lệ.";
                        item.EvidenceLevelAfter = PaymentEvidenceHelper.ComputeEvidenceLevel(sub);
                        result.Items.Add(item);
                        continue;
                    }

                    var link = await payOS.PaymentRequests.GetAsync(orderCode);
                    var payosStatus = NormalizeStatus(link.Status);
                    item.PayOsStatus = payosStatus;
                    item.PayOsAmountPaid = link.AmountPaid;

                    var dbStatus = (sub.Status ?? string.Empty).ToLowerInvariant();
                    var isPending = dbStatus == "pending";
                    var note = (string?)null;
                    var action = "evidence_only";
                    var isConflict = false;

                    // Always capture evidence first (this does not change Status/dates).
                    ApplyPaymentLinkEvidence(sub, link, "backfill");

                    if (isPending && payosStatus == "PAID")
                    {
                        var paidAt = sub.PaidAt ?? DateTime.UtcNow;
                        sub.PaidAt = paidAt;
                        sub.StartDate = paidAt;

                        var plan = sub.Plan ?? await _planRepo.GetPlanById(sub.Plan_id);
                        if (plan != null && plan.Duration > 0)
                            sub.EndDate = paidAt.AddDays(plan.Duration);

                        if (sub.EndDate.HasValue && sub.EndDate.Value <= DateTime.UtcNow)
                        {
                            sub.Status = "expired";
                            action = "status_updated";
                            note = "Đã đồng bộ thanh toán nhưng gói đã hết hạn.";
                        }
                        else
                        {
                            sub.Status = "active";
                            action = "activated";
                            note = "Đã kích hoạt gói từ dữ liệu PayOS.";
                        }

                        // Conflict: the account already has a later active subscription.
                        var userSubs = await _subscriptionRepo.GetSubscriptionsByAccountId(sub.Account_id);
                        var laterActive = userSubs
                            .Where(o => o.Sub_id != sub.Sub_id && !o.IsDeleted &&
                                        string.Equals(o.Status, "active", StringComparison.OrdinalIgnoreCase) &&
                                        o.EndDate.HasValue && sub.EndDate.HasValue &&
                                        o.EndDate.Value > sub.EndDate.Value)
                            .OrderByDescending(o => o.EndDate)
                            .FirstOrDefault();

                        if (laterActive != null)
                        {
                            sub.Status = "superseded";
                            isConflict = true;
                            action = "status_updated";
                            note = $"Đã kích hoạt nhưng bị thay thế bởi gói còn hạn đến {laterActive.EndDate:yyyy-MM-dd HH:mm} (UTC).";
                        }
                    }
                    else if (isPending && (payosStatus == "CANCELLED" || payosStatus == "EXPIRED" || payosStatus == "FAILED"))
                    {
                        sub.Status = MapPayOsStatusToDb(link.Status);
                        action = "status_updated";
                        note = $"Đồng bộ trạng thái từ PayOS: {payosStatus}.";
                    }
                    else if (isPending && (payosStatus == "PENDING" || payosStatus == "PROCESSING" || payosStatus == "UNDERPAID"))
                    {
                        action = "evidence_only";
                        note = payosStatus == "UNDERPAID"
                            ? "Thanh toán thiếu (underpaid) — giữ trạng thái pending."
                            : "PayOS chưa ghi nhận thanh toán — chỉ lưu bằng chứng.";
                    }
                    else
                    {
                        // DB already beyond pending: only fill evidence, never touch status/dates.
                        action = "evidence_only";
                        if ((payosStatus == "CANCELLED" || payosStatus == "EXPIRED" || payosStatus == "FAILED") &&
                            (dbStatus == "active" || dbStatus == "expired"))
                        {
                            isConflict = true;
                            note = $"Xung đột: DB={dbStatus} nhưng PayOS={payosStatus}.";
                        }
                        else if (payosStatus == "PAID" && (dbStatus == "cancelled" || dbStatus == "expired"))
                        {
                            // Money was collected after we cancelled/expired the row — needs manual review.
                            isConflict = true;
                            note = $"Xung đột: PayOS=PAID nhưng DB={dbStatus} — chỉ lưu bằng chứng, cần đối soát thủ công.";
                        }
                        else
                        {
                            note = "Chỉ bổ sung bằng chứng (không đổi trạng thái).";
                        }
                    }

                    item.Action = request.DryRun ? "dry_run" : action;
                    item.Note = note;

                    if (isConflict) result.Conflicts++;

                    if (request.DryRun)
                    {
                        item.EvidenceLevelAfter = PaymentEvidenceHelper.ComputeEvidenceLevel(sub);
                    }
                    else
                    {
                        await _subscriptionRepo.UpdateSubscription(sub);
                        result.Updated++;
                        item.EvidenceLevelAfter = PaymentEvidenceHelper.ComputeEvidenceLevel(sub);
                    }

                    result.Items.Add(item);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "PayOS evidence sync failed for subscription {SubId} (PaymentRef={PaymentRef})", sub.Sub_id, orderCodeText);
                    item.Action = "error";
                    item.Note = ex.Message;
                    item.EvidenceLevelAfter = PaymentEvidenceHelper.ComputeEvidenceLevel(sub);
                    result.Failed++;
                    result.Items.Add(item);
                }
            }

            result.Processed = result.Items.Count;
            result.Skipped = result.Items.Count(i => i.Action == "skipped");

            _logger.LogInformation(
                "PayOS evidence sync finished (dryRun={DryRun}, {From}..{To}): processed={Processed}, updated={Updated}, skipped={Skipped}, failed={Failed}, conflicts={Conflicts}",
                result.DryRun, fromVn, toVn, result.Processed, result.Updated, result.Skipped, result.Failed, result.Conflicts);

            return result;
        }

        // ------------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------------

        private PayOSClient CreatePayOsClient()
        {
            var clientId = _configuration["PayOS:ClientId"];
            if (string.IsNullOrEmpty(clientId)) clientId = _configuration["PAYOS_CLIENT_ID"];

            var apiKey = _configuration["PayOS:ApiKey"];
            if (string.IsNullOrEmpty(apiKey)) apiKey = _configuration["PAYOS_API_KEY"];

            var checksumKey = _configuration["PayOS:ChecksumKey"];
            if (string.IsNullOrEmpty(checksumKey)) checksumKey = _configuration["PAYOS_CHECKSUM_KEY"];

            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(checksumKey))
                throw new InvalidOperationException("PayOS credentials are not configured.");

            return new PayOSClient(clientId.Trim(), apiKey.Trim(), checksumKey.Trim());
        }

        /// <summary>
        /// Copies PayOS payment-link evidence onto the subscription. Never changes Status/StartDate/EndDate.
        /// </summary>
        private void ApplyPaymentLinkEvidence(Subscription sub, PaymentLink link, string source)
        {
            if (sub == null || link == null) return;

            var providerStatus = NormalizeStatus(link.Status);

            sub.PaymentProvider = "PayOS";
            sub.PaymentLinkId = !string.IsNullOrWhiteSpace(link.Id) ? link.Id : sub.PaymentLinkId;
            sub.ProviderStatus = providerStatus;
            if (link.AmountPaid > 0)
                sub.PricePaid = link.AmountPaid;

            var firstTx = link.Transactions?
                .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Reference))
                ?? link.Transactions?.FirstOrDefault();

            DateTime? paidAt = null;
            if (firstTx != null)
            {
                if (!string.IsNullOrWhiteSpace(firstTx.Reference))
                    sub.BankReference = firstTx.Reference;
                if (!string.IsNullOrWhiteSpace(firstTx.Description))
                    sub.PaymentDescription = firstTx.Description;

                paidAt = ParsePayOsTransactionTime(firstTx.TransactionDateTime);
            }

            if (!paidAt.HasValue && providerStatus == "PAID")
                paidAt = PaymentEvidenceHelper.ParsePayOsTime(link.CreatedAt);

            if (paidAt.HasValue)
                sub.PaidAt = paidAt;

            try
            {
                sub.RawEvidence = JsonSerializer.Serialize(link, EvidenceJsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to serialize PayOS evidence for subscription {SubId}", sub.Sub_id);
            }

            sub.EvidenceSource = source;
            sub.EvidenceSyncedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Parses a PayOS timestamp string. PayOS reports Vietnam local time without an offset,
        /// so values are shifted back by 7 hours and marked UTC.
        /// </summary>
        private static DateTime? ParsePayOsTransactionTime(string? raw)
            => PaymentEvidenceHelper.ParsePayOsTime(raw);

        /// <summary>
        /// Maps a PayOS payment-link status onto the internal database status.
        /// </summary>
        private static string MapPayOsStatusToDb(PaymentLinkStatus status)
        {
            var payosStatus = NormalizeStatus(status);
            return payosStatus switch
            {
                "PAID" => "active",
                "EXPIRED" => "expired",
                "CANCELLED" => "cancelled",
                "FAILED" => "cancelled",
                _ => "pending" // PENDING / PROCESSING / UNDERPAID
            };
        }

        private static string NormalizeStatus(PaymentLinkStatus status)
            => status.ToString().ToUpperInvariant();

        private async Task ActivateSubscriptionAsync(Subscription subscription, DateTime? paidAt = null)
        {
            var plan = await _planRepo.GetPlanById(subscription.Plan_id);
            if (plan == null) return;

            var now = DateTime.UtcNow;
            var startDate = paidAt ?? subscription.PaidAt ?? now;
            int rolloverDays = 0;

            var userSubs = await _subscriptionRepo.GetSubscriptionsByAccountId(subscription.Account_id);
            var activeSub = userSubs.FirstOrDefault(s =>
                s.Sub_id != subscription.Sub_id && !s.IsDeleted &&
                string.Equals(s.Status, "active", StringComparison.OrdinalIgnoreCase) &&
                s.EndDate.HasValue && s.EndDate.Value > now);

            if (activeSub != null)
            {
                double remaining = (activeSub.EndDate!.Value - now).TotalDays;
                if (remaining > 0)
                {
                    rolloverDays = (int)Math.Ceiling(remaining);
                }
                activeSub.Status = "superseded";
                await _subscriptionRepo.UpdateSubscription(activeSub);
                _logger.LogInformation("Superseded existing subscription {OldSubId} for account {AccountId}", activeSub.Sub_id, subscription.Account_id);
            }

            DateTime? endDate = null;
            if (plan.Duration > 0)
            {
                endDate = startDate.AddDays(plan.Duration + rolloverDays);
            }

            subscription.Status = "active";
            subscription.StartDate = startDate;
            subscription.EndDate = endDate;

            await _subscriptionRepo.UpdateSubscription(subscription);
            _logger.LogInformation("Subscription {SubId} activated for account {AccountId}. StartDate={StartDate}, Duration={Duration} days, Rollover={RolloverDays} days, EndDate={EndDate}",
                subscription.Sub_id, subscription.Account_id, startDate, plan.Duration, rolloverDays, endDate);
        }

        private static string? ReadString(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var prop)) return null;
            return prop.ValueKind == JsonValueKind.String ? prop.GetString() : null;
        }

        private static long? ReadLong(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var prop)) return null;
            return prop.ValueKind switch
            {
                JsonValueKind.Number => prop.TryGetInt64(out var l) ? l : null,
                JsonValueKind.String => long.TryParse(prop.GetString(), out var parsed) ? parsed : null,
                _ => null
            };
        }

        /// <summary>
        /// Extracts the "Purpose of Transaction" (subfield 08 inside EMV tag 62)
        /// from a VietQR payload string — this is exactly what banking apps display
        /// as "Nội dung chuyển khoản".
        /// </summary>
        private static string ExtractPurposeOfTransaction(string qrCode)
        {
            if (string.IsNullOrEmpty(qrCode) || qrCode.Length < 4)
                return null;

            int index = 0;
            while (index <= qrCode.Length - 4)
            {
                var tag = qrCode.Substring(index, 2);
                if (tag == "63") break;

                if (!int.TryParse(qrCode.Substring(index + 2, 2), out var length))
                    break;

                if (index + 4 + length > qrCode.Length)
                    break;

                var value = qrCode.Substring(index + 4, length);

                if (tag == "62")
                    return ExtractSubfield08(value);

                index += 4 + length;
            }

            return null;
        }

        private static string ExtractSubfield08(string additionalData)
        {
            int index = 0;
            while (index <= additionalData.Length - 4)
            {
                var tag = additionalData.Substring(index, 2);
                if (!int.TryParse(additionalData.Substring(index + 2, 2), out var length))
                    break;
                if (index + 4 + length > additionalData.Length)
                    break;
                var value = additionalData.Substring(index + 4, length);
                if (tag == "08")
                    return value;
                index += 4 + length;
            }
            return null;
        }
    }
}
