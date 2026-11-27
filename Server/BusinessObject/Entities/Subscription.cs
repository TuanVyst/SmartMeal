using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Entities
{
    [Table("Subscription")]
    public class Subscription
    {
        [Key]
        public Guid Sub_id { get; set; } = Guid.NewGuid();

        [ForeignKey("Account")]
        public Guid Account_id { get; set; }

        [ForeignKey("Plan")]
        public Guid Plan_id { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        /// <summary>
        /// active | expired | cancelled | pending | superseded
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; }

        [MaxLength(255)]
        public string PaymentRef { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public double PricePaid { get; set; } = 0;

        // ---- Promotion snapshot (price at the time of purchase) ----

        /// <summary>Plan list price before any promotion. 0 for legacy rows (fall back to Plan.Price).</summary>
        [Column(TypeName = "decimal(18,2)")]
        public double OriginalPrice { get; set; } = 0;

        /// <summary>Applied discount percentage (0 when no promotion).</summary>
        [Column(TypeName = "decimal(5,2)")]
        public double DiscountPercent { get; set; } = 0;

        public Guid? PromotionId { get; set; }

        public bool IsDeleted { get; set; } = false;

        // ---- Transaction / payment evidence ----

        /// <summary>
        /// Row creation timestamp (UTC). Distinct from StartDate (service period start).
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Actual payment confirmation time reported by the payment provider (UTC).
        /// </summary>
        public DateTime? PaidAt { get; set; }

        /// <summary>
        /// "PayOS" | "AdminGrant"
        /// </summary>
        [MaxLength(20)]
        public string? PaymentProvider { get; set; }

        /// <summary>
        /// PayOS payment link id (e.g. 4f1a...).
        /// </summary>
        [MaxLength(100)]
        public string? PaymentLinkId { get; set; }

        /// <summary>
        /// Bank transaction reference (PayOS transaction reference).
        /// </summary>
        [MaxLength(100)]
        public string? BankReference { get; set; }

        /// <summary>
        /// Transfer content / description shown on the bank statement.
        /// </summary>
        [MaxLength(255)]
        public string? PaymentDescription { get; set; }

        /// <summary>
        /// Raw provider status: PENDING | PAID | CANCELLED | EXPIRED | UNDERPAID | PROCESSING | FAILED
        /// </summary>
        [MaxLength(30)]
        public string? ProviderStatus { get; set; }

        /// <summary>
        /// Raw PayOS payload (JSON) kept as reconciliation evidence.
        /// </summary>
        [Column(TypeName = "text")]
        public string? RawEvidence { get; set; }

        /// <summary>
        /// "webhook" | "poll" | "backfill" | "admin"
        /// </summary>
        [MaxLength(20)]
        public string? EvidenceSource { get; set; }

        public DateTime? EvidenceSyncedAt { get; set; }

        /// <summary>
        /// Admin account that granted this subscription (null for regular purchases).
        /// </summary>
        public Guid? GrantedByAccountId { get; set; }

        // Navigation properties
        public virtual Account Account { get; set; }
        public virtual Plan Plan { get; set; }
        public virtual Promotion? Promotion { get; set; }
        public virtual Account? GrantedByAccount { get; set; }
    }
}
