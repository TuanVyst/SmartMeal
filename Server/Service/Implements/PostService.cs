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
    public class PostService : IPostService
    {
        private readonly IPostRepo _postRepo;
        private readonly ILogger<PostService> _logger;

        public PostService(IPostRepo postRepo, ILogger<PostService> logger)
        {
            _postRepo = postRepo;
            _logger = logger;
        }

        public async Task<List<PostResponseDto>> GetAllPosts()
        {
            var items = await _postRepo.GetAllPosts();
            return items.Select(MapToDto).ToList();
        }

        public async Task<PostResponseDto?> GetPostById(Guid id)
        {
            var item = await _postRepo.GetPostById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<PostResponseDto> CreatePost(PostRequest request)
        {
            try
            {
                var newItem = new Post
                {
                    Post_id = Guid.NewGuid(),
                    Account_id = request.Account_id,
                    Description = request.Description,
                    Image = request.Image,
                    CreatedAt = DateTime.UtcNow,
                    Status = request.Status,
                    IsDeleted = false
                };

                var result = await _postRepo.CreatePost(newItem);
                _logger.LogInformation("Post '{Post_id}' created successfully", newItem.Post_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Post");
                throw;
            }
        }

        public async Task<PostResponseDto> UpdatePost(Guid id, PostRequest request)
        {
            try
            {
                var existingItem = await _postRepo.GetPostById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Post with id {id} not found");

                existingItem.Account_id = request.Account_id;
                existingItem.Description = request.Description;
                existingItem.Image = request.Image;
                existingItem.Status = request.Status;

                var result = await _postRepo.UpdatePost(existingItem);
                _logger.LogInformation("Post '{Post_id}' updated successfully", existingItem.Post_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Post '{Post_id}'", id);
                throw;
            }
        }

        public async Task<PostResponseDto> SoftDeletePost(Guid id)
        {
            var result = await _postRepo.SoftDeletePost(id);
            return MapToDto(result);
        }
        
        private PostResponseDto MapToDto(Post entity)
        {
            if (entity == null) return null;
            return new PostResponseDto
            {
                Post_id = entity.Post_id,
                Account_id = entity.Account_id,
                Description = entity.Description,
                Image = entity.Image,
                CreatedAt = entity.CreatedAt,
                Status = entity.Status,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
