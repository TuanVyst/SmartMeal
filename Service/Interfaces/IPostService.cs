using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPostService
    {
        Task<List<PostResponseDto>> GetAllPosts();
        Task<PostResponseDto?> GetPostById(Guid id);
        Task<PostResponseDto> CreatePost(PostRequest post);
        Task<PostResponseDto> UpdatePost(Guid id, PostRequest post);
        Task<PostResponseDto> SoftDeletePost(Guid id);
    }
}
