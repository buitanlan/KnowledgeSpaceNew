using System.Net;
using System.Text.Json;

namespace KnowledgeSpace.BackendServer.Helpers;

public class ErrorWrappingMiddleware(RequestDelegate next, ILogger<ErrorWrappingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next.Invoke(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);

            context.Response.StatusCode = 500;
        }

        if (!context.Response.HasStarted && context.Response.StatusCode != (int)HttpStatusCode.NoContent)
        {
            context.Response.ContentType = "application/json";

            var response = new ApiResponse(context.Response.StatusCode);

            var json = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(json);
        }
    }
}
