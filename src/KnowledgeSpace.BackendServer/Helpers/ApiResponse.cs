using System.Text.Json.Serialization;

namespace KnowledgeSpace.BackendServer.Helpers;

public class ApiResponse(int statusCode, string message = null)
{
    public int StatusCode { get; } = statusCode;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string Message { get; } = message ?? GetDefaultMessageForStatusCode(statusCode);

    private static string? GetDefaultMessageForStatusCode(int statusCode)
    {
        return statusCode switch
        {
            404 => "Resource not found",
            500 => "An unhandled error occurred",
            _ => null
        };
    }
}
