using BusinessObject.Entities;
using BusinessObject.Dtos.ResponseModels;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos.RequestModels;

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

        public async Task<List<AffiliateProductResponse>> GetAllAffiliateProducts()
        {
            var affiliateProducts = await _affiliateProductRepo.GetAllAffiliateProducts();
            return affiliateProducts.Select(MapToResponse).ToList();
        }

        public async Task<AffiliateProductResponse?> GetAffiliateProductById(Guid id)
        {
            var affiliateProduct = await _affiliateProductRepo.GetAffiliateProductById(id);
            return affiliateProduct == null ? null : MapToResponse(affiliateProduct);
        }

        public async Task<AffiliateProductResponse> CreateAffiliateProduct(AffiliateProductRequest affiliateProduct)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(affiliateProduct.Name))
                    throw new ArgumentException("Name is required", nameof(affiliateProduct.Name));
                if (affiliateProduct.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(affiliateProduct.Name));
                if (string.IsNullOrWhiteSpace(affiliateProduct.Link))
                    throw new ArgumentException("Link is required", nameof(affiliateProduct.Link));
                if (affiliateProduct.Price < 0)
                    throw new ArgumentException("Price cannot be negative", nameof(affiliateProduct.Price));
                if (affiliateProduct.Partner_id == Guid.Empty)
                    throw new ArgumentException("Valid Partner_id is required", nameof(affiliateProduct.Partner_id));
                if (affiliateProduct.Ingredient_id == Guid.Empty)
                    throw new ArgumentException("Valid Ingredient_id is required", nameof(affiliateProduct.Ingredient_id));

                var newAffiliateProduct = new AffiliateProduct
                {
                    Product_id = Guid.NewGuid(),
                    Partner_id = affiliateProduct.Partner_id,
                    Ingredient_id = affiliateProduct.Ingredient_id,
                    Name = affiliateProduct.Name,
                    Link = affiliateProduct.Link,
                    Price = affiliateProduct.Price,
                    IsDeleted = false
                };

                var result = await _affiliateProductRepo.CreateAffiliateProduct(newAffiliateProduct);
                _logger.LogInformation("AffiliateProduct '{ProductId}' ({Name}) created successfully", newAffiliateProduct.Product_id, newAffiliateProduct.Name);
                return result == null
                    ? throw new InvalidOperationException("Failed to add affiliate product to database")
                    : MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding affiliate product");
                throw;
            }
        }

        public async Task<AffiliateProductResponse> UpdateAffiliateProduct(Guid id, AffiliateProductRequest affiliateProduct)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(affiliateProduct.Name))
                    throw new ArgumentException("Name is required", nameof(affiliateProduct.Name));
                if (affiliateProduct.Name.Length > 256)
                    throw new ArgumentException("Name cannot exceed 256 characters", nameof(affiliateProduct.Name));
                if (string.IsNullOrWhiteSpace(affiliateProduct.Link))
                    throw new ArgumentException("Link is required", nameof(affiliateProduct.Link));
                if (affiliateProduct.Price < 0)
                    throw new ArgumentException("Price cannot be negative", nameof(affiliateProduct.Price));
                if (affiliateProduct.Partner_id == Guid.Empty)
                    throw new ArgumentException("Valid Partner_id is required", nameof(affiliateProduct.Partner_id));
                if (affiliateProduct.Ingredient_id == Guid.Empty)
                    throw new ArgumentException("Valid Ingredient_id is required", nameof(affiliateProduct.Ingredient_id));

                var existingAffiliateProduct = await _affiliateProductRepo.GetAffiliateProductById(id);
                if (existingAffiliateProduct == null)
                    throw new KeyNotFoundException($"AffiliateProduct with id {id} not found");

                existingAffiliateProduct.Name = affiliateProduct.Name;
                existingAffiliateProduct.Link = affiliateProduct.Link;
                existingAffiliateProduct.Price = affiliateProduct.Price;
                existingAffiliateProduct.Partner_id = affiliateProduct.Partner_id;
                existingAffiliateProduct.Ingredient_id = affiliateProduct.Ingredient_id;

                var result = await _affiliateProductRepo.UpdateAffiliateProduct(existingAffiliateProduct);
                _logger.LogInformation("AffiliateProduct '{ProductId}' updated successfully", existingAffiliateProduct.Product_id);
                return MapToResponse(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating affiliate product '{ProductId}'", id);
                throw;
            }
        }

        public async Task<AffiliateProductResponse> SoftDeleteAffiliateProduct(Guid id)
        {
            var result = await _affiliateProductRepo.SoftDeleteAffiliateProduct(id);
            return MapToResponse(result);
        }

        private static AffiliateProductResponse MapToResponse(AffiliateProduct affiliateProduct)
        {
            return new AffiliateProductResponse
            {
                Product_id = affiliateProduct.Product_id,
                Partner_id = affiliateProduct.Partner_id,
                Ingredient_id = affiliateProduct.Ingredient_id,
                Name = affiliateProduct.Name,
                Link = affiliateProduct.Link,
                Price = affiliateProduct.Price,
                IsDeleted = affiliateProduct.IsDeleted
            };
        }
    }
}
