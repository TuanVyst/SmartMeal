using BusinessObject.Entities;
using System;

namespace BusinessObject.Helpers
{
    /// <summary>
    /// Single source of truth for promotion state and effective plan pricing.
    /// Must be used by every surface that displays or charges a plan price.
    /// </summary>
    public static class PlanPricingHelper
    {
        public const string StatusScheduled = "scheduled";
        public const string StatusActive = "active";
        public const string StatusExpired = "expired";
        public const string StatusDisabled = "disabled";

        /// <summary>PayOS rejects amounts below 1.000 VND.</summary>
        public const double MinimumChargeableAmount = 1000;

        public static bool IsPromotionActive(Promotion? promotion, DateTime nowUtc)
        {
            return promotion != null
                && promotion.IsActive
                && !promotion.IsDeleted
                && promotion.StartAt <= nowUtc
                && nowUtc <= promotion.EndAt;
        }

        /// <summary>
        /// Returns the price the customer actually pays. Never returns less than
        /// <see cref="MinimumChargeableAmount"/>; when the discount would go below
        /// that floor the base price is kept instead of producing an invalid amount.
        /// </summary>
        public static double ResolveEffectivePrice(double basePrice, Promotion? promotion, DateTime nowUtc)
        {
            if (basePrice <= 0 || !IsPromotionActive(promotion, nowUtc))
                return basePrice;

            return ComputeDiscountedPrice(basePrice, promotion!.DiscountPercent);
        }

        /// <summary>
        /// Applies a percentage discount regardless of the promotion window.
        /// Returns the base price when the result would be invalid (&lt; 1.000 VND).
        /// </summary>
        public static double ComputeDiscountedPrice(double basePrice, double discountPercent)
        {
            if (basePrice <= 0 || discountPercent <= 0) return basePrice;

            var discounted = Math.Round(
                basePrice * (100 - discountPercent) / 100,
                0,
                MidpointRounding.AwayFromZero);

            if (discounted < MinimumChargeableAmount || discounted >= basePrice)
                return basePrice;

            return discounted;
        }

        public static string DeriveStatus(Promotion promotion, DateTime nowUtc)
        {
            if (promotion.IsDeleted) return StatusExpired;
            if (!promotion.IsActive) return StatusDisabled;
            if (nowUtc < promotion.StartAt) return StatusScheduled;
            if (nowUtc > promotion.EndAt) return StatusExpired;
            return StatusActive;
        }

        /// <summary>Normalises a DateTime coming from JSON/DB to UTC.</summary>
        public static DateTime ToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }
    }
}
