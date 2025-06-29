namespace KnowledgeSpace.BackendServer.Helpers;

public class ApiNotFoundResponse(string message): ApiResponse(404, message);
