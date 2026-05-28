using BusinessObject.Entities;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Implements
{
    public class AffiliateProductRepo : IAffiliateProductRepo
    {
        private readonly AppDbContext _ctx;
        public AffiliateProductRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<AffiliateProduct>> GetAllAffiliateProducts()
        {
            return await _ctx.AffiliateProducts
                .Include(a => a.Partner)
                .Include(a => a.Ingredient)
                .Include(a => a.GroceryItems)
                .Where(a => a.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<AffiliateProduct?> GetAffiliateProductById(Guid id)
            => await _ctx.AffiliateProducts
                .Include(a => a.Partner)
                .Include(a => a.Ingredient)
                .Include(a => a.GroceryItems)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Product_id == id);

        public async Task<AffiliateProduct> CreateAffiliateProduct(AffiliateProduct affiliateProduct)
        {
            _ctx.AffiliateProducts.Add(affiliateProduct);
            await _ctx.SaveChangesAsync();
            return affiliateProduct;
        }

        public async Task<AffiliateProduct> UpdateAffiliateProduct(AffiliateProduct affiliateProduct)
        {
            _ctx.AffiliateProducts.Update(affiliateProduct);
            await _ctx.SaveChangesAsync();
            return affiliateProduct;
        }

        public async Task<AffiliateProduct> SoftDeleteAffiliateProduct(Guid id)
        {
            var affiliateProduct = _ctx.AffiliateProducts.Where(a => a.IsDeleted == false).FirstOrDefault(a => a.Product_id == id);
            if (affiliateProduct == null)
                throw new Exception("AffiliateProduct not found");
            affiliateProduct.IsDeleted = true;
            _ctx.AffiliateProducts.Update(affiliateProduct);
            await _ctx.SaveChangesAsync();
            return affiliateProduct;
        }
    }
}
