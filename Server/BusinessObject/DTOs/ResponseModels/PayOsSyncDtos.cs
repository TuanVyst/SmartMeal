using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.ResponseModels
{
    public class PayOsSyncItemDto
    {
        public Guid SubId { get; set; }
        public string? OrderCode { get; set; }
        public string? DbStatus { get; set; }
        public string? PayOsStatus { get; set; }
        public double DbAmount { get; set; }
        public double PayOsAmountPaid { get; set; }

        /// <summary>"activated" | "evidence_only" | "status_updated" | "skipped" | "dry_run" | "error"</summary>
        public string Action { get; set; } = "skipped";

        public string? Note { get; set; }

        /// <summary>"full" | "partial" | "internal" | "none"</summary>
        public string EvidenceLevelAfter { get; set; } = "none";
    }

    public class PayOsSyncResultDto
    {
        public bool DryRun { get; set; }

        /// <summary>Vietnam calendar date used for the lower bound (inclusive).</summary>
        public DateTime FromDate { get; set; }

        /// <summary>Vietnam calendar date used for the upper bound (inclusive).</summary>
        public DateTime ToDate { get; set; }

        public int Processed { get; set; }
        public int Updated { get; set; }
        public int Skipped { get; set; }
        public int Failed { get; set; }
        public int Conflicts { get; set; }
        public List<PayOsSyncItemDto> Items { get; set; } = new List<PayOsSyncItemDto>();
    }

    public class PayOsVerificationTransactionDto
    {
        public string? Reference { get; set; }
        public long Amount { get; set; }
        public string? AccountNumber { get; set; }
        public string? Description { get; set; }

        /// <summary>Raw PayOS value, Vietnam local time without offset (yyyy-MM-dd HH:mm:ss).</summary>
        public string? TransactionDateTime { get; set; }

        public string? VirtualAccountName { get; set; }
        public string? VirtualAccountNumber { get; set; }
        public string? CounterAccountBankId { get; set; }
        public string? CounterAccountBankName { get; set; }
        public string? CounterAccountName { get; set; }
        public string? CounterAccountNumber { get; set; }
    }

    /// <summary>
    /// Live PayOS verification snapshot for a single order code.
    /// </summary>
    public class PayOsVerificationDto
    {
        public bool Available { get; set; }
        public string? Status { get; set; }
        public long Amount { get; set; }
        public long AmountPaid { get; set; }
        public long AmountRemaining { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CanceledAt { get; set; }
        public string? CancellationReason { get; set; }
        public List<PayOsVerificationTransactionDto> Transactions { get; set; } = new List<PayOsVerificationTransactionDto>();
        public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
    }

    public class DailyRevenueDto
    {
        /// <summary>Vietnam calendar date (yyyy-MM-dd).</summary>
        public string Date { get; set; } = string.Empty;

        public double Revenue { get; set; }
        public int Count { get; set; }
    }

    public class PlanRevenueDto
    {
        public Guid PlanId { get; set; }
        public string? PlanName { get; set; }
        public int Count { get; set; }
        public double Revenue { get; set; }
    }

    public class SubscriptionOverviewDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public double Revenue { get; set; }
        public int SuccessfulCount { get; set; }
        public int PendingCount { get; set; }
        public int CancelledCount { get; set; }
        public int ExpiredCount { get; set; }
        public int ActiveSubscribers { get; set; }
        public int AdminGrantCount { get; set; }
        public double AdminGrantValue { get; set; }
        public double AvgOrderValue { get; set; }
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new List<DailyRevenueDto>();
        public List<PlanRevenueDto> PlanBreakdown { get; set; } = new List<PlanRevenueDto>();
    }
}
