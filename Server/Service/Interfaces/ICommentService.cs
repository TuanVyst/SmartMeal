using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ICommentService
    {
        Task<List<CommentResponseDto>> GetAllComments();
        Task<CommentResponseDto?> GetCommentById(Guid id);
        Task<CommentResponseDto> CreateComment(CommentRequest comment);
        Task<CommentResponseDto> UpdateComment(Guid id, CommentRequest comment);
        Task<CommentResponseDto> SoftDeleteComment(Guid id);
    }
}
