using MyApp.Application.Models;
using Microsoft.EntityFrameworkCore;
using MyApp.Application.Interfaces;
using MyApp.Domain.Entities;
using MyApp.Domain.ValueObjects;

namespace MyApp.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<List<User>> Get(CancellationToken ct)
    {
        var users = await _context.Users.ToListAsync(ct);
        return users;
    }
    public async Task<User?> GetById(UserId id, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        return user;
    }

    public async Task<User?> GetByIdWithReactions(UserId id, CancellationToken ct)
{
    // obtiene el usuario junto con sus reacciones
    return await _context.Users
        .Include(u => u.Reactions)
        .FirstOrDefaultAsync(u => u.Id == id, ct);
}
    public async Task<User?> GetByEmail(EmailAddress emailAddress, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailAddress, ct);
        return user;
    }
    public async Task<User> Add(User entity, CancellationToken ct)
    {
        _context.Users.Add(entity);
        await SaveChanges(ct);
        return entity;
    }
    public async Task Delete(User entity, CancellationToken ct)
    {
        _context.Users.Remove(entity);
        await SaveChanges(ct);
    }
    public async Task Update(User entity, CancellationToken ct)
    {
        _context.Users.Update(entity);
        await SaveChanges(ct);
    }
    public async Task<bool> EmailExists(EmailAddress email)
    {
        var exists = await _context.Users.FirstOrDefaultAsync(u => u.Email == email) ?? null;
        if (exists is null)
            return false;
        else return true;
    }
    public Task<ReactionSummaryDTO> GetPostReactions(PostId postId, UserId? viewer, CancellationToken ct) =>
        SummarizeReactions(_context.Users.SelectMany(u => u.Reactions!).Where(r => r.Post == postId), viewer, ct);

    public Task<ReactionSummaryDTO> GetCommentReactions(CommentId commentId, UserId? viewer, CancellationToken ct) =>
        SummarizeReactions(_context.Users.SelectMany(u => u.Reactions!).Where(r => r.Comment == commentId), viewer, ct);

    private static async Task<ReactionSummaryDTO> SummarizeReactions(
        IQueryable<Reaction> reactions, UserId? viewer, CancellationToken ct)
    {
        var counts = await reactions.GroupBy(r => r.Type)
            .Select(group => new
            {
                IsLike = group.Key,
                Count = group.Count(),
                Selected = viewer != null && group.Any(r => r.User == viewer.Value)
            })
            .ToListAsync(ct);

        return new ReactionSummaryDTO(
            counts.Find(group => group.IsLike)?.Count ?? 0,
            counts.Find(group => !group.IsLike)?.Count ?? 0,
            counts.Find(group => group.Selected)?.IsLike);
    }

    private async Task<int> SaveChanges(CancellationToken cancellationToken)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}