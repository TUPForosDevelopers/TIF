using MyApp.Application.Models;
using MyApp.Domain.Entities;
using MyApp.Domain.ValueObjects;

namespace MyApp.Application.Interfaces;

public interface IUserRepository
{
    Task<List<User>> Get(CancellationToken ct);
    Task<User?> GetById(UserId id, CancellationToken ct);
    Task<User?> GetByIdWithReactions(UserId id, CancellationToken ct);
    Task<User?> GetByEmail(EmailAddress emailAddress, CancellationToken ct);
    Task<User> Add(User entity, CancellationToken ct);
    Task Delete(User entity, CancellationToken ct);
    Task Update(User entity, CancellationToken ct);
    Task<ReactionSummaryDTO> GetPostReactions(PostId postId, UserId? viewer, CancellationToken ct);
    Task<ReactionSummaryDTO> GetCommentReactions(CommentId commentId, UserId? viewer, CancellationToken ct);
    Task<bool> EmailExists(EmailAddress email);
}