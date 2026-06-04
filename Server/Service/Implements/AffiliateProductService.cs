using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class AffiliateProductService : IAffiliateProductService
    {
        private readonly IAffiliateProductRepo _affiliateProductRepo;
        private readonly ILogger<AffiliateProductService> _logger;

        public AffiliateProductService(IAffiliateProductRepo affiliateProductRepo, ILogger<AffiliateProductService> logger)
        {
            _affiliateProductRepo = affiliateProductRepo;
            _logger = logger;
        }

        public async Task<List<AffiliateProductResponseDto>> GetAllAffiliateProducts()
        {
            var items = await _affiliateProductRepo.GetAllAffiliateProducts();
            return items.Select(MapToDto).ToList();
        }

        public async Task<AffiliateProductResponseDto?> GetAffiliateProductById(Guid id)
        {
            var item = await _affiliateProductRepo.GetAffiliateProductById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<AffiliateProductResponseDto> CreateAffiliateProduct(AffiliateProductRequest request)
        {
            try
            {
                var newItem = new AffiliateProduct
                {
                    Product_id = Guid.NewGuid(),
                    Partner_id = request.Partner_id,
                    Ingredient_id = request.Ingredient_id,
                    Name = request.Name,
                    Link = request.Link,
                    Price = request.Price,
                    IsDeleted = false
                };

                var result = await _affiliateProductRepo.CreateAffiliateProduct(newItem);
                _logger.LogInformation("AffiliateProduct '{Product_id}' created successfully", newItem.Product_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating AffiliateProduct");
                throw;
            }
        }

        public async Task<AffiliateProductResponseDto> UpdateAffiliateProduct(Guid id, AffiliateProductRequest request)
        {
            try
            {
                var existingItem = await _affiliateProductRepo.GetAffiliateProductById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"AffiliateProduct with id {id} not found");

                existingItem.Partner_id = request.Partner_id;
                existingItem.Ingredient_id = request.Ingredient_id;
                existingItem.Name = request.Name;
                existingItem.Link = request.Link;
                existingItem.Price = request.Price;

                var result = await _affiliateProductRepo.UpdateAffiliateProduct(existingItem);
                _logger.LogInformation("AffiliateProduct '{Product_id}' updated successfully", existingItem.Product_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating AffiliateProduct '{Product_id}'", id);
                throw;
            }
        }

        public async Task<AffiliateProductResponseDto> SoftDeleteAffiliateProduct(Guid id)
        {
            var result = await _affiliateProductRepo.SoftDeleteAffiliateProduct(id);
            return MapToDto(result);
        }
        
        private AffiliateProductResponseDto MapToDto(AffiliateProduct entity)
        {
            if (entity == null) return null;
            return new AffiliateProductResponseDto
            {
                Product_id = entity.Product_id,
                Partner_id = entity.Partner_id,
                Ingredient_id = entity.Ingredient_id,
                Name = entity.Name,
                Link = entity.Link,
                Price = entity.Price,
                IsDeleted = entity.IsDeleted,
                Partner = entity.Partner != null ? new PartnerSimpleDto
                {
                    Partner_id = entity.Partner.Partner_id,
                    Name = entity.Partner.Name
                } : null,
                Ingredient = entity.Ingredient != null ? new IngredientSimpleDto
                {
                    Ingredient_id = entity.Ingredient.Ingredient_id,
                    Name = entity.Ingredient.Name,
                    AveragePrice = entity.Ingredient.AveragePrice,
                    ImageUrl = entity.Ingredient.ImageUrl
                } : null
            };
        }
    }
}
