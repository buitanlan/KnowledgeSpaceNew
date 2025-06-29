using KnowledgeSpace.BackendServer.Helpers;

namespace KnowledgeSpace.BackendServer.Extensions;

public static class MiddlewareExtensions
{
    public static void UseErrorWrapping(this IApplicationBuilder builder)
    {
        builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api"),
            appBuilder => appBuilder.UseMiddleware<ErrorWrappingMiddleware>());
    }
}
