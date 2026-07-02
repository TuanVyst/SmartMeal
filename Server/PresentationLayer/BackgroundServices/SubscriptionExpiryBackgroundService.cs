using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PresentationLayer.BackgroundServices
{
    public class SubscriptionExpiryBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SubscriptionExpiryBackgroundService> _logger;
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

        public SubscriptionExpiryBackgroundService(IServiceProvider serviceProvider, ILogger<SubscriptionExpiryBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SubscriptionExpiryBackgroundService started. Checking every {Interval} minutes.", Interval.TotalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ExpireSubscriptionsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while expiring subscriptions");
                }

                await Task.Delay(Interval, stoppingToken);
            }

            _logger.LogInformation("SubscriptionExpiryBackgroundService stopped.");
        }

        private async Task ExpireSubscriptionsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTime.UtcNow;
            var expiredSubscriptions = await ctx.Subscriptions
                .Where(s => !s.IsDeleted && s.Status == "active" && s.EndDate != null && s.EndDate <= now)
                .ToListAsync();

            if (expiredSubscriptions.Count == 0)
            {
                _logger.LogDebug("No expired subscriptions found at {Time}", now);
                return;
            }

            foreach (var sub in expiredSubscriptions)
            {
                sub.Status = "expired";
            }

            await ctx.SaveChangesAsync();
            _logger.LogInformation("Expired {Count} subscriptions at {Time}", expiredSubscriptions.Count, now);
        }
    }
}
