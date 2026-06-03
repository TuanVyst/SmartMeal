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
    public class CommentRepo : ICommentRepo
    {
        private readonly AppDbContext _ctx;
        public CommentRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Comment>> GetAllComments()
        {
            return await _ctx.Comments
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Comment?> GetCommentById(Guid id)
            => await _ctx.Comments
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Comment_id == id);

        public async Task<Comment> CreateComment(Comment comment)
        {
            _ctx.Comments.Add(comment);
            await _ctx.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> UpdateComment(Comment comment)
        {
            _ctx.Comments.Update(comment);
            await _ctx.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment> SoftDeleteComment(Guid id)
        {
            var comment = _ctx.Comments.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Comment_id == id);
            if (comment == null)
                throw new Exception("Comment not found");
            comment.IsDeleted = true;
            _ctx.Comments.Update(comment);
            await _ctx.SaveChangesAsync();
            return comment;
        }
    }
}
