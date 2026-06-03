using BusinessObject.Entities;

namespace Repository.Interfaces
{
    public interface IPostRepo
    {
        Task<List<Post>> GetAllPosts();
        Task<Post?> GetPostById(Guid id);
        Task<Post> CreatePost(Post post);
        Task<Post> UpdatePost(Post post);
        Task<Post> SoftDeletePost(Guid id);
    }
}
