using KnowledgeSpace.BackendServer.Data.Entities;

namespace KnowledgeSpace.BackendServer.Services;

public interface ITokenService
{
    Task<string> CreateTokenAsync(User user);
}