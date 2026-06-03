using BusinessObject.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Repository.Interfaces
{
    public interface ICommentRepo
    {
        Task<List<Comment>> GetAllComments();
        Task<Comment?> GetCommentById(Guid id);
        Task<Comment> CreateComment(Comment comment);
        Task<Comment> UpdateComment(Comment comment);
        Task<Comment> SoftDeleteComment(Guid id);
    }
}
