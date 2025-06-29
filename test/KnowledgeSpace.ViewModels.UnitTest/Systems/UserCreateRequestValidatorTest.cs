using System.Globalization;
using KnowledgeSpace.ViewModels.Systems;
using Xunit;

namespace KnowledgeSpace.ViewModels.UnitTest.Systems;

public class UserCreateRequestValidatorTest
{
    private UserCreateRequestValidator validator = new();
    private UserCreateRequest request = new()
    {
        Dob = DateTime.Now.ToString(CultureInfo.InvariantCulture),
        Email = "tedu.international@gmail.com",
        FirstName = "Test",
        LastName = "test",
        Password = "Admin@123",
        PhoneNumber = "12345",
        UserName = "test"
    };

    [Fact]
    public void Should_Valid_Result_When_Valid_Request()
    {
        var result = validator.Validate(request);
        Assert.True(result.IsValid);
    }
    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_UserName(string userName)
    {
        request.UserName = userName;
        var result = validator.Validate(request);
        Assert.False(result.IsValid);
    }
    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_LastName(string data)
    {
        request.LastName = data;
        var result = validator.Validate(request);
        Assert.False(result.IsValid);
    }
    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_FirstName(string data)
    {
        request.FirstName = data;
        var result = validator.Validate(request);
        Assert.False(result.IsValid);
    }
    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_PhoneNumber(string data)
    {
        request.PhoneNumber = data;
        var result = validator.Validate(request);
        Assert.False(result.IsValid);
    }
    [Theory]
    [InlineData("sdasfaf")]
    [InlineData("1234567")]
    [InlineData("Admin123")]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Password_Not_Match(string data)
    {
        request.Password = data;
        var result = validator.Validate(request);
        Assert.False(result.IsValid);
    }
}
