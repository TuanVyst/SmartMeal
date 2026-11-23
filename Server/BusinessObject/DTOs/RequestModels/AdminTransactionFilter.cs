using System;

namespace BusinessObject.Dtos.RequestModels
{
    /// <summary>
    /// Filter for the admin transaction dashboard (GET /api/Subscription/admin/transactions).
    /// All dates are interpreted as Vietnam (UTC+7) calendar dates.
    /// </summary>
    public class AdminTransactionFilter
    {
        public string? Search { get; set; }
        public string? Status { get; set; }

        /// <summary>"payos" | "admin_grant" | "all"</summary>
        public string? Source { get; set; }

        public Guid? PlanId { get; set; }
        public Guid? AccountId { get; set; }

        /// <summary>Inclusive Vietnam calendar date (00:00 VN).</summary>
        public DateTime? FromDate { get; set; }

        /// <summary>Inclusive Vietnam calendar date (through 23:59:59.999 VN).</summary>
        public DateTime? ToDate { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;

        /// <summary>"createdAt" (default) | "paidAt" | "amount"</summary>
        public string SortBy { get; set; } = "createdAt";

        /// <summary>"asc" | "desc" (default)</summary>
        public string SortDir { get; set; } = "desc";

        public bool IncludeDeleted { get; set; } = false;
    }
}
