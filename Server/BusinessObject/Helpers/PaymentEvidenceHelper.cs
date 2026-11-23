using BusinessObject.Entities;
using System;
using System.Globalization;

namespace BusinessObject.Helpers
{
    /// <summary>
    /// Shared helpers for payment evidence / reconciliation (PayOS + admin grants).
    /// </summary>
    public static class PaymentEvidenceHelper
    {
        /// <summary>
        /// True when the subscription was granted by an admin (no real PayOS payment).
        /// </summary>
        public static bool IsAdminGrant(Subscription subscription)
        {
            if (subscription == null) return false;

            if (string.Equals(subscription.PaymentProvider, "AdminGrant", StringComparison.OrdinalIgnoreCase))
                return true;

            return !string.IsNullOrEmpty(subscription.PaymentRef) &&
                   subscription.PaymentRef.StartsWith("ADMIN_GRANT_", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// "internal" (admin grant) | "full" | "partial" | "none".
        /// </summary>
        public static string ComputeEvidenceLevel(Subscription subscription)
        {
            if (subscription == null) return "none";

            if (IsAdminGrant(subscription))
                return "internal";

            var hasOrderCode = !string.IsNullOrWhiteSpace(subscription.PaymentRef);
            var hasLink = !string.IsNullOrWhiteSpace(subscription.PaymentLinkId);
            var hasBankRef = !string.IsNullOrWhiteSpace(subscription.BankReference);
            var hasPaidAt = subscription.PaidAt.HasValue;
            var isPaid = string.Equals(subscription.ProviderStatus, "PAID", StringComparison.OrdinalIgnoreCase);

            if (hasLink && hasBankRef && hasPaidAt && isPaid)
                return "full";

            return hasOrderCode ? "partial" : "none";
        }

        /// <summary>
        /// Converts a Vietnam (UTC+7) calendar date to the UTC instant at 00:00 Vietnam time.
        /// </summary>
        public static DateTime ToVnStartUtc(DateTime date)
            => DateTime.SpecifyKind(date.Date.AddHours(-7), DateTimeKind.Utc);

        /// <summary>
        /// Converts a Vietnam calendar date (inclusive) to the exclusive UTC upper bound
        /// (i.e. 00:00 Vietnam of the following day).
        /// </summary>
        public static DateTime ToVnEndUtcExclusive(DateTime date)
            => ToVnStartUtc(date.Date.AddDays(1));

        private static readonly string[] VnTimeFormats =
        {
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss.fff",
            "yyyy-MM-ddTHH:mm:ss",
            "yyyy-MM-ddTHH:mm:ss.fff",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd"
        };

        /// <summary>
        /// Parses a PayOS timestamp. PayOS sends Vietnam local time without an offset
        /// ("yyyy-MM-dd HH:mm:ss"), while the database stores UTC — so VN values are
        /// shifted back by 7 hours and marked as UTC. ISO-8601 values with an explicit
        /// offset/UTC marker keep their instant.
        /// </summary>
        public static DateTime? ParsePayOsTime(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return null;

            var value = raw.Trim();

            // Explicit offset / Zulu -> absolute instant.
            if (value.EndsWith("Z", StringComparison.OrdinalIgnoreCase) ||
                value.Contains("+") ||
                value.LastIndexOf('-') > 10)
            {
                if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dto))
                    return dto.UtcDateTime;
            }

            if (DateTime.TryParseExact(value, VnTimeFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var vnTime))
                return DateTime.SpecifyKind(vnTime.AddHours(-7), DateTimeKind.Utc);

            if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var fallback))
                return fallback.UtcDateTime;

            return null;
        }
    }
}
