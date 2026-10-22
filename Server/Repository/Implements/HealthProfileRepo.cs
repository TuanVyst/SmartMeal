using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class HealthProfileRepo : IHealthProfileRepo
    {
        private readonly AppDbContext _ctx;
        private static readonly ConcurrentDictionary<Guid, (HealthProfile Profile, DateTime Expiry)> _cache = new();

        public HealthProfileRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public static void InvalidateCache(Guid? accountId = null)
        {
            if (accountId.HasValue)
                _cache.TryRemove(accountId.Value, out _);
            else
                _cache.Clear();
        }

        public async Task<List<HealthProfile>> GetAllHealthProfiles()
        {
            return await _ctx.HealthProfiles
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<HealthProfile?> GetHealthProfileByAccountId(Guid accountId)
        {
            if (_cache.TryGetValue(accountId, out var entry) && DateTime.UtcNow < entry.Expiry)
            {
                return entry.Profile;
            }

            var profile = await _ctx.HealthProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(h => h.Account_id == accountId && !h.IsDeleted);

            if (profile != null)
            {
                _cache[accountId] = (profile, DateTime.UtcNow.AddMinutes(5));
            }
            return profile;
        }

        public async Task<HealthProfile?> GetHealthProfileById(Guid id)
        {
            return await _ctx.HealthProfiles
                .FirstOrDefaultAsync(h => h.Profile_id == id && !h.IsDeleted);
        }

        public async Task<HealthProfile> CreateHealthProfile(HealthProfile healthProfile)
        {
            _ctx.HealthProfiles.Add(healthProfile);
            await _ctx.SaveChangesAsync();
            _cache[healthProfile.Account_id] = (healthProfile, DateTime.UtcNow.AddMinutes(5));
            return healthProfile;
        }

        public async Task<HealthProfile> UpdateHealthProfile(HealthProfile healthProfile)
        {
            if (_ctx.Entry(healthProfile).State == EntityState.Detached)
            {
                _ctx.HealthProfiles.Update(healthProfile);
            }
            await _ctx.SaveChangesAsync();
            _cache[healthProfile.Account_id] = (healthProfile, DateTime.UtcNow.AddMinutes(5));
            return healthProfile;
        }
    }
}