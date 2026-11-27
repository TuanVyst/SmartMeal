using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    /// <summary>
    /// One row of the admin transaction dashboard.
    /// Dates are returned as UTC DateTime (client formats to the local timezone).
    /// </summary>
    public class AdminTransactionDto
    {
        public Guid SubId { get; set; }
        public string? OrderCode { get; set; }
        public string? PaymentLinkId { get; set; }
        public string? BankReference { get; set; }

        /// <summary>"PayOS" | "AdminGrant"</summary>
        public string Source { get; set; } = "PayOS";

        public string Status { get; set; } = string.Empty;
        public string? ProviderStatus { get; set; }

        public double PricePaid { get; set; }
        public double PlanPrice { get; set; }
        public double OriginalPrice { get; set; }
        public double DiscountPercent { get; set; }
        public string? PlanName { get; set; }
        public int PlanDurationDays { get; set; }
        public int PlanTier { get; set; }

        public Guid AccountId { get; set; }
        public string? AccountName { get; set; }
        public string? AccountUsername { get; set; }
        public string? AccountEmail { get; set; }
        public string? AccountPhone { get; set; }
        public DateTime? AccountCreatedAt { get; set; }

        public DateTime? CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? PaymentDescription { get; set; }

        /// <summary>"full" | "partial" | "internal" | "none"</summary>
        public string EvidenceLevel { get; set; } = "none";

        public DateTime? EvidenceSyncedAt { get; set; }
        public string? EvidenceSource { get; set; }

        public bool IsAdminGrant { get; set; }
        public Guid? GrantedByAccountId { get; set; }
        public string? GrantedByName { get; set; }
    }

    /// <summary>
    /// Full detail for a single transaction, including the raw PayOS payload.
    /// </summary>
    public class AdminTransactionDetailDto : AdminTransactionDto
    {
        public string? RawEvidence { get; set; }
        public bool IsDeleted { get; set; }
        public bool AccountIsActive { get; set; }
    }

    public class AdminTransactionSummaryDto
    {
        public int TotalTransactions { get; set; }
        public int SuccessfulCount { get; set; }
        public int PendingCount { get; set; }
        public int CancelledCount { get; set; }
        public int ExpiredCount { get; set; }
        public double TotalRevenue { get; set; }
        public int AdminGrantCount { get; set; }
        public double AdminGrantValue { get; set; }
        public double AvgOrderValue { get; set; }

        /// <summary>Distinct accounts that have at least one row matching the current filter.</summary>
        public int DistinctSubscribers { get; set; }

        /// <summary>System-wide snapshot of accounts with an active subscription (not filter-dependent).</summary>
        public int ActiveSubscribers { get; set; }

        /// <summary>Paid, non-admin transactions grouped by plan (same predicate as TotalRevenue).</summary>
        public List<PlanRevenueDto> PlanBreakdown { get; set; } = new List<PlanRevenueDto>();
    }

    public class PlanRevenueDto
    {
        public Guid PlanId { get; set; }
        public string? PlanName { get; set; }
        public int Count { get; set; }
        public double Revenue { get; set; }
    }

    public class AdminTransactionListResponse
    {
        public List<AdminTransactionDto> Items { get; set; } = new List<AdminTransactionDto>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public AdminTransactionSummaryDto Summary { get; set; } = new AdminTransactionSummaryDto();
    }
}
