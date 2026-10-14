using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Service.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class StatisticService : IStatisticService
    {
        private readonly AppDbContext _ctx;

        public StatisticService(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<object> GetSubscriptionStatisticsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = _ctx.Subscriptions
                .Include(s => s.Plan)
                .Where(s => !s.IsDeleted && s.Status == "PAID" || s.Status == "active");

            if (startDate.HasValue)
                query = query.Where(s => s.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(s => s.StartDate <= endDate.Value);

            var subscriptions = await query.ToListAsync();

            var totalSubscribers = subscriptions.Count;
            var totalRevenue = subscriptions.Sum(s => s.PricePaid);

            var planStats = subscriptions
                .GroupBy(s => new { s.Plan_id, s.Plan.Name })
                .Select(g => new
                {
                    PlanId = g.Key.Plan_id,
                    PlanName = g.Key.Name,
                    SubscriberCount = g.Count(),
                    Revenue = g.Sum(s => s.PricePaid)
                })
                .ToList();

            return new
            {
                TotalSubscribers = totalSubscribers,
                TotalRevenue = totalRevenue,
                PlanStatistics = planStats
            };
        }

        public async Task<object> GetWeeklyEngagementStatisticsAsync(DateTime? targetDate = null)
        {
            // Vietnam Timezone offset +7
            var vnNow = DateTime.UtcNow.AddHours(7);
            int currentDayOfWeekNow = (int)vnNow.DayOfWeek;
            int diffToMondayNow = currentDayOfWeekNow == 0 ? 6 : currentDayOfWeekNow - 1;
            var currentRealWeekMondayVn = vnNow.Date.AddDays(-diffToMondayNow);

            // Target week calculation in VN time (+7)
            DateTime vnRefDate;
            if (targetDate.HasValue)
            {
                vnRefDate = new DateTime(targetDate.Value.Year, targetDate.Value.Month, targetDate.Value.Day, 12, 0, 0);
            }
            else
            {
                vnRefDate = vnNow;
            }

            int currentDayOfWeek = (int)vnRefDate.DayOfWeek; // Sunday = 0, Monday = 1, ...
            int diffToMonday = currentDayOfWeek == 0 ? 6 : currentDayOfWeek - 1;
            var thisWeekMondayVn = new DateTime(vnRefDate.Year, vnRefDate.Month, vnRefDate.Day, 0, 0, 0).AddDays(-diffToMonday); // Monday 00:00:00 VN

            // Convert VN Monday 00:00:00 to UTC (subtract 7 hours) and explicitly specify DateTimeKind.Utc for Npgsql
            var thisWeekStartUtc = DateTime.SpecifyKind(thisWeekMondayVn.AddHours(-7), DateTimeKind.Utc);
            var thisWeekEndUtc = DateTime.SpecifyKind(thisWeekStartUtc.AddDays(7), DateTimeKind.Utc);

            var lastWeekStartUtc = DateTime.SpecifyKind(thisWeekStartUtc.AddDays(-7), DateTimeKind.Utc);
            var lastWeekEndUtc = thisWeekStartUtc;

            bool isCurrentWeek = thisWeekMondayVn.Date == currentRealWeekMondayVn.Date;

            // 1. New Accounts registered in the week
            var thisWeekNewAccounts = await _ctx.Accounts
                .Where(a => a.CreatedAt >= thisWeekStartUtc && a.CreatedAt < thisWeekEndUtc)
                .CountAsync();

            var lastWeekNewAccounts = await _ctx.Accounts
                .Where(a => a.CreatedAt >= lastWeekStartUtc && a.CreatedAt < lastWeekEndUtc)
                .CountAsync();

            // 2. Visits and Sessions in the week
            var thisWeekSessions = await _ctx.UserSessionLogs
                .Where(s => s.StartTime >= thisWeekStartUtc && s.StartTime < thisWeekEndUtc)
                .ToListAsync();

            var lastWeekSessions = await _ctx.UserSessionLogs
                .Where(s => s.StartTime >= lastWeekStartUtc && s.StartTime < lastWeekEndUtc)
                .ToListAsync();

            var thisWeekVisits = thisWeekSessions.Count;
            var lastWeekVisits = lastWeekSessions.Count;

            var activeUsersThisWeek = thisWeekSessions
                .Where(s => s.Account_id.HasValue)
                .Select(s => s.Account_id!.Value)
                .Distinct()
                .Count();

            double avgVisitsPerUser = activeUsersThisWeek > 0
                ? Math.Round((double)thisWeekVisits / activeUsersThisWeek, 1)
                : thisWeekVisits;

            // 3. Usage Time (Average and Total)
            var thisWeekTotalDurationSeconds = thisWeekSessions.Sum(s => s.DurationSeconds);
            var lastWeekTotalDurationSeconds = lastWeekSessions.Sum(s => s.DurationSeconds);

            // Average duration in minutes and seconds per session
            double thisWeekAvgDurationMinutes = thisWeekVisits > 0
                ? Math.Round((double)thisWeekTotalDurationSeconds / thisWeekVisits / 60.0, 1)
                : 0;

            double lastWeekAvgDurationMinutes = lastWeekVisits > 0
                ? Math.Round((double)lastWeekTotalDurationSeconds / lastWeekVisits / 60.0, 1)
                : 0;

            int thisWeekAvgDurationSeconds = thisWeekVisits > 0
                ? (int)Math.Round((double)thisWeekTotalDurationSeconds / thisWeekVisits)
                : 0;

            int lastWeekAvgDurationSeconds = lastWeekVisits > 0
                ? (int)Math.Round((double)lastWeekTotalDurationSeconds / lastWeekVisits)
                : 0;

            double thisWeekTotalDurationHours = Math.Round((double)thisWeekTotalDurationSeconds / 3600.0, 1);


            // 4. Recipe Selection Statistics (Time to First Recipe Select)
            // Bounded by DurationSeconds to eliminate historical idle tab skew
            var thisWeekRecipeSelectSessions = thisWeekSessions
                .Where(s => s.TimeToFirstRecipeSelectSeconds.HasValue)
                .ToList();
            var lastWeekRecipeSelectSessions = lastWeekSessions
                .Where(s => s.TimeToFirstRecipeSelectSeconds.HasValue)
                .ToList();

            var thisWeekRecipeSelectCount = thisWeekRecipeSelectSessions.Count;
            var lastWeekRecipeSelectCount = lastWeekRecipeSelectSessions.Count;

            double thisWeekAvgTimeToRecipeSelectSeconds = thisWeekRecipeSelectCount > 0
                ? Math.Round(thisWeekRecipeSelectSessions.Average(s => Math.Min(s.TimeToFirstRecipeSelectSeconds!.Value, Math.Max(s.DurationSeconds, 0))), 1)
                : 0;

            double lastWeekAvgTimeToRecipeSelectSeconds = lastWeekRecipeSelectCount > 0
                ? Math.Round(lastWeekRecipeSelectSessions.Average(s => Math.Min(s.TimeToFirstRecipeSelectSeconds!.Value, Math.Max(s.DurationSeconds, 0))), 1)
                : 0;

            double thisWeekAvgTimeToRecipeSelectMinutes = Math.Round(thisWeekAvgTimeToRecipeSelectSeconds / 60.0, 1);
            double lastWeekAvgTimeToRecipeSelectMinutes = Math.Round(lastWeekAvgTimeToRecipeSelectSeconds / 60.0, 1);
            double thisWeekRecipeSelectRate = thisWeekVisits > 0
                ? Math.Round(((double)thisWeekRecipeSelectCount / thisWeekVisits) * 100.0, 1)
                : 0;

            double lastWeekRecipeSelectRate = lastWeekVisits > 0
                ? Math.Round(((double)lastWeekRecipeSelectCount / lastWeekVisits) * 100.0, 1)
                : 0;

            // 5. Meal Plan Dishes Statistics (Average dishes added to meal plans per week)
            var thisWeekMealEntries = await _ctx.MealPlanEntries
                .Include(e => e.MealPlanDay)
                .ThenInclude(d => d.MealPlan)
                .Where(e => !e.IsDeleted
                            && !e.MealPlanDay.IsDeleted
                            && !e.MealPlanDay.MealPlan.IsDeleted
                            && e.MealPlanDay.DayDate >= thisWeekStartUtc
                            && e.MealPlanDay.DayDate < thisWeekEndUtc)
                .Select(e => new
                {
                    e.Entry_id,
                    DayDate = e.MealPlanDay.DayDate,
                    AccountId = e.MealPlanDay.MealPlan.Account_id
                })
                .ToListAsync();

            var lastWeekMealEntries = await _ctx.MealPlanEntries
                .Include(e => e.MealPlanDay)
                .ThenInclude(d => d.MealPlan)
                .Where(e => !e.IsDeleted
                            && !e.MealPlanDay.IsDeleted
                            && !e.MealPlanDay.MealPlan.IsDeleted
                            && e.MealPlanDay.DayDate >= lastWeekStartUtc
                            && e.MealPlanDay.DayDate < lastWeekEndUtc)
                .Select(e => new
                {
                    e.Entry_id,
                    DayDate = e.MealPlanDay.DayDate,
                    AccountId = e.MealPlanDay.MealPlan.Account_id
                })
                .ToListAsync();

            var thisWeekTotalPlanDishes = thisWeekMealEntries.Count;
            var thisWeekPlanUsersCount = thisWeekMealEntries.Select(e => e.AccountId).Distinct().Count();
            double thisWeekAvgDishesPerUser = thisWeekPlanUsersCount > 0
                ? Math.Round((double)thisWeekTotalPlanDishes / thisWeekPlanUsersCount, 1)
                : 0;

            var lastWeekTotalPlanDishes = lastWeekMealEntries.Count;
            var lastWeekPlanUsersCount = lastWeekMealEntries.Select(e => e.AccountId).Distinct().Count();
            double lastWeekAvgDishesPerUser = lastWeekPlanUsersCount > 0
                ? Math.Round((double)lastWeekTotalPlanDishes / lastWeekPlanUsersCount, 1)
                : 0;
            // Growth calculation helper
            static double CalcGrowth(double curr, double prev)
            {
                if (prev == 0) return curr > 0 ? 100.0 : 0.0;
                return Math.Round(((curr - prev) / prev) * 100.0, 1);
            }

            var newAccountsGrowth = CalcGrowth(thisWeekNewAccounts, lastWeekNewAccounts);
            var visitsGrowth = CalcGrowth(thisWeekVisits, lastWeekVisits);
            var durationGrowth = CalcGrowth(thisWeekAvgDurationMinutes, lastWeekAvgDurationMinutes);
            var timeToRecipeSelectGrowth = CalcGrowth(thisWeekAvgTimeToRecipeSelectSeconds, lastWeekAvgTimeToRecipeSelectSeconds);
            var recipeSelectCountGrowth = CalcGrowth(thisWeekRecipeSelectCount, lastWeekRecipeSelectCount);
            var avgDishesGrowth = CalcGrowth(thisWeekAvgDishesPerUser, lastWeekAvgDishesPerUser);
            var totalPlanDishesGrowth = CalcGrowth(thisWeekTotalPlanDishes, lastWeekTotalPlanDishes);

            // 4. Daily breakdown (Monday to Sunday)
            var dayNames = new[] { "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật" };
            var dailyStats = new List<object>();

            for (int i = 0; i < 7; i++)
            {
                var dayStartUtc = DateTime.SpecifyKind(thisWeekStartUtc.AddDays(i), DateTimeKind.Utc);
                var dayEndUtc = DateTime.SpecifyKind(dayStartUtc.AddDays(1), DateTimeKind.Utc);
                var dayVn = thisWeekMondayVn.AddDays(i);

                var daySessions = thisWeekSessions
                    .Where(s => s.StartTime >= dayStartUtc && s.StartTime < dayEndUtc)
                    .ToList();

                var dayNewAccounts = await _ctx.Accounts
                    .Where(a => a.CreatedAt >= dayStartUtc && a.CreatedAt < dayEndUtc)
                    .CountAsync();

                var dayVisits = daySessions.Count;
                var dayTotalSeconds = daySessions.Sum(s => s.DurationSeconds);
                var dayAvgMinutes = dayVisits > 0 ? Math.Round((double)dayTotalSeconds / dayVisits / 60.0, 1) : 0;
                var dayAvgSeconds = dayVisits > 0 ? (int)Math.Round((double)dayTotalSeconds / dayVisits) : 0;

                var dayRecipeSelectSessions = daySessions
                    .Where(s => s.TimeToFirstRecipeSelectSeconds.HasValue)
                    .ToList();
                var dayRecipeSelectCount = dayRecipeSelectSessions.Count;
                var dayAvgTimeToRecipeSelectSeconds = dayRecipeSelectCount > 0
                    ? Math.Round(dayRecipeSelectSessions.Average(s => Math.Min(s.TimeToFirstRecipeSelectSeconds!.Value, Math.Max(s.DurationSeconds, 0))), 1)
                    : 0;
                var dayAvgTimeToRecipeSelectMinutes = Math.Round(dayAvgTimeToRecipeSelectSeconds / 60.0, 1);

                var dayPlanDishesCount = thisWeekMealEntries
                    .Where(e => e.DayDate >= dayStartUtc && e.DayDate < dayEndUtc)
                    .Count();
                dailyStats.Add(new
                {
                    DayIndex = i,
                    DayName = dayNames[i],
                    Date = dayVn.ToString("dd/MM"),
                    FullDate = dayVn.ToString("yyyy-MM-dd"),
                    IsToday = dayVn.Date == vnNow.Date,
                    IsFuture = dayVn.Date > vnNow.Date,
                    NewAccounts = dayNewAccounts,
                    Visits = dayVisits,
                    AvgDurationMinutes = dayAvgMinutes,
                    AvgDurationSeconds = dayAvgSeconds,
                    TotalDurationMinutes = Math.Round(dayTotalSeconds / 60.0, 1),
                    TotalDurationSeconds = dayTotalSeconds,
                    RecipeSelectCount = dayRecipeSelectCount,
                    AvgTimeToRecipeSelectSeconds = dayAvgTimeToRecipeSelectSeconds,
                    AvgTimeToRecipeSelectMinutes = dayAvgTimeToRecipeSelectMinutes,
                    PlanDishes = dayPlanDishesCount
                });
            }

            return new
            {
                ThisWeek = new
                {
                    StartDate = thisWeekMondayVn.ToString("dd/MM/yyyy"),
                    EndDate = thisWeekMondayVn.AddDays(6).ToString("dd/MM/yyyy"),
                    SelectedDate = thisWeekMondayVn.ToString("yyyy-MM-dd"),
                    PreviousWeekDate = thisWeekMondayVn.AddDays(-7).ToString("yyyy-MM-dd"),
                    NextWeekDate = thisWeekMondayVn.AddDays(7).ToString("yyyy-MM-dd"),
                    IsCurrentWeek = isCurrentWeek,
                    CanGoNext = thisWeekMondayVn < currentRealWeekMondayVn,
                    NewAccounts = thisWeekNewAccounts,
                    TotalVisits = thisWeekVisits,
                    ActiveUsers = activeUsersThisWeek,
                    AvgVisitsPerUser = avgVisitsPerUser,
                    AvgDurationMinutes = thisWeekAvgDurationMinutes,
                    AvgDurationSeconds = thisWeekAvgDurationSeconds,
                    TotalDurationHours = thisWeekTotalDurationHours,
                    TotalDurationSeconds = thisWeekTotalDurationSeconds,
                    AvgTimeToRecipeSelectSeconds = thisWeekAvgTimeToRecipeSelectSeconds,
                    AvgTimeToRecipeSelectMinutes = thisWeekAvgTimeToRecipeSelectMinutes,
                    RecipeSelectCount = thisWeekRecipeSelectCount,
                    RecipeSelectRate = thisWeekRecipeSelectRate,
                    TotalPlanDishes = thisWeekTotalPlanDishes,
                    PlanUsersCount = thisWeekPlanUsersCount,
                    AvgDishesPerUser = thisWeekAvgDishesPerUser
                },
                LastWeek = new
                {
                    NewAccounts = lastWeekNewAccounts,
                    TotalVisits = lastWeekVisits,
                    AvgDurationMinutes = lastWeekAvgDurationMinutes,
                    AvgDurationSeconds = lastWeekAvgDurationSeconds,
                    TotalDurationSeconds = lastWeekTotalDurationSeconds,
                    AvgTimeToRecipeSelectSeconds = lastWeekAvgTimeToRecipeSelectSeconds,
                    AvgTimeToRecipeSelectMinutes = lastWeekAvgTimeToRecipeSelectMinutes,
                    RecipeSelectCount = lastWeekRecipeSelectCount,
                    RecipeSelectRate = lastWeekRecipeSelectRate,
                    TotalPlanDishes = lastWeekTotalPlanDishes,
                    PlanUsersCount = lastWeekPlanUsersCount,
                    AvgDishesPerUser = lastWeekAvgDishesPerUser
                },
                Growth = new
                {
                    NewAccounts = newAccountsGrowth,
                    Visits = visitsGrowth,
                    AvgDuration = durationGrowth,
                    AvgTimeToRecipeSelect = timeToRecipeSelectGrowth,
                    RecipeSelectCount = recipeSelectCountGrowth,
                    AvgDishesPerUser = avgDishesGrowth,
                    TotalPlanDishes = totalPlanDishesGrowth
                },
                DailyStats = dailyStats
            };
        }
    }
}
