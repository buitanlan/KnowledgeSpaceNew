namespace KnowledgeSpace.ViewModels.Systems;

public class UserCreateRequest
{
    public string UserName { get; set; } = string.Empty;

    public string Password { get; set; } = "User@123";

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Dob { get; set; } = string.Empty;
}
