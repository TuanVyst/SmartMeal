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
    public class PostRepo : IPostRepo
    {
        private readonly AppDbContext _ctx;
        public PostRepo(AppDbContext context)
        {
            _ctx = context;
        }

        public async Task<List<Post>> GetAllPosts()
        {
            return await _ctx.Posts
                .Where(i => i.IsDeleted == false)
                .ToListAsync();
        }

        public async Task<Post?> GetPostById(Guid id)
            => await _ctx.Posts
                .Where(i => !i.IsDeleted)
                .FirstOrDefaultAsync(i => i.Post_id == id);

        public async Task<Post> CreatePost(Post post)
        {
            _ctx.Posts.Add(post);
            await _ctx.SaveChangesAsync();
            return post;
        }

        public async Task<Post> UpdatePost(Post post)
        {
            _ctx.Posts.Update(post);
            await _ctx.SaveChangesAsync();
            return post;
        }

        public async Task<Post> SoftDeletePost(Guid id)
        {
            var post = _ctx.Posts.Where(i => i.IsDeleted == false).FirstOrDefault(i => i.Post_id == id);
            if (post == null)
                throw new Exception("Post not found");
            post.IsDeleted = true;
            _ctx.Posts.Update(post);
            await _ctx.SaveChangesAsync();
            return post;
        }
    }
}
