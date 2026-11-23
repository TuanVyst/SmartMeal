using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos.RequestModels
{
    /// <summary>
    /// Request for POST /api/Subscription/admin/transactions/sync-payos.
    /// Defaults are chosen so the endpoint can be called with an empty body for a safe dry run.
    /// </summary>
    public class PayOsSyncRequest
    {
        /// <summary>When true (default) nothing is persisted, only predictions are returned.</summary>
        public bool DryRun { get; set; } = true;

        /// <summary>
        /// Vietnam calendar date (inclusive). Null = 2026-11-19 (the official launch date).
        /// Transactions before this date are test data and must not be synced.
        /// </summary>
        public DateTime? FromDate { get; set; }

        /// <summary>Vietnam calendar date (inclusive). Null = today (Vietnam).</summary>
        public DateTime? ToDate { get; set; }

        /// <summary>DB statuses to include. Null/empty = all payable statuses.</summary>
        public List<string>? Statuses { get; set; }

        /// <summary>Restrict to specific subscription ids.</summary>
        public List<Guid>? SubIds { get; set; }

        /// <summary>Max candidates processed per call (1..100).</summary>
        public int Limit { get; set; } = 25;

        /// <summary>
        /// Candidate offset for batched force re-syncs (only meaningful when <see cref="Force"/> is true).
        /// Rows updated by a normal (non-force) batch leave the candidate set, so offset stays 0 there.
        /// </summary>
        public int Offset { get; set; } = 0;

        /// <summary>When true, re-fetch transactions that already have full evidence.</summary>
        public bool Force { get; set; } = false;
    }
}
