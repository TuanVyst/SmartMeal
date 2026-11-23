using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Service.Interfaces;
using BusinessObject.Dtos.RequestModels;
using System;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
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
        private readonly IPaymentService _paymentService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(
            ISubscriptionService subscriptionService,
            IPaymentService paymentService,
            ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _paymentService = paymentService;
            _logger = logger;
        }

        private Guid GetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Account ID not found in token");
            return Guid.Parse(claim.Value);
        }

        private Guid? TryGetAccountId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return null;
            return Guid.TryParse(claim.Value, out var id) ? id : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? accountId = null)
        {
            try
            {
                var jwtAccountId = GetAccountId();
                var targetAccountId = accountId.HasValue && accountId.Value != Guid.Empty ? accountId.Value : jwtAccountId;

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

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            try
            {
                var items = await _subscriptionService.GetAllSubscriptions();
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all subscriptions for admin");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // Admin transaction dashboard
        // ------------------------------------------------------------------

        [HttpGet("admin/transactions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminTransactions([FromQuery] AdminTransactionFilter filter)
        {
            try
            {
                var data = await _subscriptionService.GetAdminTransactionsAsync(filter ?? new AdminTransactionFilter());
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin transactions");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("admin/transactions/export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportAdminTransactions([FromQuery] AdminTransactionFilter filter)
        {
            try
            {
                var csv = await _subscriptionService.BuildAdminTransactionsCsvAsync(filter ?? new AdminTransactionFilter());

                var preamble = Encoding.UTF8.GetPreamble(); // EF BB BF
                var body = Encoding.UTF8.GetBytes(csv);
                var bytes = new byte[preamble.Length + body.Length];
                Buffer.BlockCopy(preamble, 0, bytes, 0, preamble.Length);
                Buffer.BlockCopy(body, 0, bytes, preamble.Length, body.Length);

                var fileName = $"smartmeal-transactions-{DateTime.UtcNow.AddHours(7):yyyyMMdd-HHmm}.csv";
                return File(bytes, "text/csv; charset=utf-8", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting admin transactions");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("admin/transactions/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminTransactionDetail(Guid id)
        {
            try
            {
                var data = await _subscriptionService.GetAdminTransactionDetailAsync(id);
                if (data == null)
                    return NotFound(new { success = false, message = "Không tìm thấy giao dịch." });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin transaction detail for {Id}", id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("admin/transactions/{id:guid}/verify-payos")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyPayOsTransaction(Guid id)
        {
            try
            {
                var detail = await _subscriptionService.GetAdminTransactionDetailAsync(id);
                if (detail == null)
                    return NotFound(new { success = false, message = "Không tìm thấy giao dịch." });

                if (detail.IsAdminGrant)
                    return BadRequest(new { success = false, message = "Giao dịch do admin cấp, không có link PayOS để đối soát." });

                if (string.IsNullOrWhiteSpace(detail.OrderCode) || !long.TryParse(detail.OrderCode, out var orderCode))
                    return BadRequest(new { success = false, message = "Giao dịch không có mã đơn PayOS hợp lệ." });

                try
                {
                    var verification = await _paymentService.VerifyPaymentLinkAsync(orderCode);
                    return Ok(new { success = true, data = verification });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "PayOS verification failed for order {OrderCode}", orderCode);
                    return StatusCode(502, new { success = false, message = ex.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying PayOS transaction for {Id}", id);
                return StatusCode(502, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("admin/transactions/sync-payos")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SyncPayOsEvidence(
            [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] PayOsSyncRequest? request)
        {
            try
            {
                request ??= new PayOsSyncRequest();
                var result = await _paymentService.SyncPayOsEvidenceAsync(request);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing PayOS evidence");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("admin/grant")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GrantByAdmin([FromBody] AdminGrantSubscriptionRequest request)
        {
            try
            {
                if (request == null || request.Account_id == Guid.Empty || request.Plan_id == Guid.Empty)
                {
                    return BadRequest(new { success = false, message = "Thiếu thông tin người dùng hoặc gói cước." });
                }

                // Audit trail: remember which admin performed the grant.
                request.GrantedByAccountId ??= TryGetAccountId();

                var item = await _subscriptionService.GrantSubscriptionByAdminAsync(request);
                return Ok(new
                {
                    success = true,
                    message = "Đã cấp/kích hoạt gói Pro cho người dùng thành công.",
                    data = item
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting subscription by admin for account {AccountId}", request?.Account_id);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("admin/revoke/{accountId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeByAdmin(Guid accountId)
        {
            try
            {
                var revoked = await _subscriptionService.RevokeActiveSubscriptionByAdminAsync(accountId);
                if (!revoked)
                {
                    return NotFound(new { success = false, message = "Người dùng hiện không có gói Pro nào đang hoạt động." });
                }
                return Ok(new { success = true, message = "Đã thu hồi gói Pro của người dùng." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking subscription by admin for account {AccountId}", accountId);
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
