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
    public class CommentService : ICommentService
    {
        private readonly ICommentRepo _commentRepo;
        private readonly ILogger<CommentService> _logger;

        public CommentService(ICommentRepo commentRepo, ILogger<CommentService> logger)
        {
            _commentRepo = commentRepo;
            _logger = logger;
        }

        public async Task<List<CommentResponseDto>> GetAllComments()
        {
            var items = await _commentRepo.GetAllComments();
            return items.Select(MapToDto).ToList();
        }

        public async Task<CommentResponseDto?> GetCommentById(Guid id)
        {
            var item = await _commentRepo.GetCommentById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<CommentResponseDto> CreateComment(CommentRequest request)
        {
            try
            {
                var newItem = new Comment
                {
                    Comment_id = Guid.NewGuid(),
                    Post_id = request.Post_id,
                    Account_id = request.Account_id,
                    Content = request.Content,
                    CreatedAt = DateTime.UtcNow,
                    IsEdited = false,
                    IsDeleted = false
                };

                var result = await _commentRepo.CreateComment(newItem);
                _logger.LogInformation("Comment '{Comment_id}' created successfully", newItem.Comment_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Comment");
                throw;
            }
        }

        public async Task<CommentResponseDto> UpdateComment(Guid id, CommentRequest request)
        {
            try
            {
                var existingItem = await _commentRepo.GetCommentById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Comment with id {id} not found");

                existingItem.Post_id = request.Post_id;
                existingItem.Account_id = request.Account_id;
                existingItem.Content = request.Content;
                existingItem.IsEdited = true;

                var result = await _commentRepo.UpdateComment(existingItem);
                _logger.LogInformation("Comment '{Comment_id}' updated successfully", existingItem.Comment_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Comment '{Comment_id}'", id);
                throw;
            }
        }

        public async Task<CommentResponseDto> SoftDeleteComment(Guid id)
        {
            var result = await _commentRepo.SoftDeleteComment(id);
            return MapToDto(result);
        }
        
        private CommentResponseDto MapToDto(Comment entity)
        {
            if (entity == null) return null;
            return new CommentResponseDto
            {
                Comment_id = entity.Comment_id,
                Post_id = entity.Post_id,
                Account_id = entity.Account_id,
                Content = entity.Content,
                CreatedAt = entity.CreatedAt,
                IsEdited = entity.IsEdited,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
