using BusinessObject.Entities;

namespace BusinessObject.Helpers
{
    /// <summary>
    /// Plan tier convention: 0 = Free, 1 = Weekly, 2 = Monthly, 3 = Yearly.
    /// Older plan rows may still have Tier = 0, so the effective tier is derived from
    /// price/duration when the stored value is not set.
    /// </summary>
    public static class PlanTierHelper
    {
        public static int DeriveTier(double price, int duration)
        {
            if (price <= 0) return 0;
            if (duration >= 365) return 3;
            if (duration >= 30) return 2;
            return 1;
        }

        public static int GetEffectiveTier(Plan? plan)
        {
            if (plan == null) return 0;
            return plan.Tier > 0 ? plan.Tier : DeriveTier(plan.Price, plan.Duration);
        }
    }
}
