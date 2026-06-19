using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;

namespace Repository.Implements
{
    public class HealthProfileRepo : IHealthProfileRepo
    {
        private readonly AppDbContext _ctx;

        public HealthProfileRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<HealthProfile>> GetAllHealthProfiles()
        {
            return await _ctx.HealthProfiles
                .Include(h => h.Account)
                .Where(h => h.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<HealthProfile?> GetHealthProfileByAccountId(Guid accountId)
        {
            return await _ctx.HealthProfiles
                .Include(h => h.Account)
                .Where(h => h.IsDeleted == false)
                .FirstOrDefaultAsync(h => h.Account_id == accountId);
        }

        public async Task<HealthProfile?> GetHealthProfileById(Guid id)
        {
            return await _ctx.HealthProfiles
                .Include(h => h.Account)
                .Where(h => h.IsDeleted == false)
                .FirstOrDefaultAsync(h => h.Profile_id == id);
        }

        public async Task<HealthProfile> CreateHealthProfile(HealthProfile healthProfile)
        {
            _ctx.HealthProfiles.Add(healthProfile);
            await _ctx.SaveChangesAsync();

            return healthProfile;
        }

        public async Task<HealthProfile> UpdateHealthProfile(HealthProfile healthProfile)
        {
            _ctx.HealthProfiles.Update(healthProfile);
            await _ctx.SaveChangesAsync();

            return healthProfile;
        }

        public async Task<HealthProfile> SoftDeleteHealthProfile(Guid id)
        {
            var healthProfile = await _ctx.HealthProfiles
                .Where(h => h.IsDeleted == false)
                .FirstOrDefaultAsync(h => h.Profile_id == id);

            if (healthProfile == null)
                throw new Exception("HealthProfile not found");

            healthProfile.IsDeleted = true;
            healthProfile.UpdatedAt = DateTime.UtcNow;

            _ctx.HealthProfiles.Update(healthProfile);
            await _ctx.SaveChangesAsync();

            return healthProfile;
        }
    }
}