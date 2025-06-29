using KnowledgeSpace.ViewModels.Systems;
using Xunit;

namespace KnowledgeSpace.ViewModels.UnitTest.Systems;

public class FunctionCreateRequestValidatorTest
{
    private FunctionCreateRequestValidator _validator = new();
    private FunctionCreateRequest _request = new()
    {
        Id = "test6",
        ParentId = null,
        Name = "test6",
        SortOrder = 6,
        Url = "/test6"
    };

    [Fact]
    public void Should_Valid_Result_When_Valid_Request()
    {
        var result = _validator.Validate(_request);
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_Id(string data)
    {
        _request.Id = data;
        var result = _validator.Validate(_request);
        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_Name(string data)
    {
        _request.Name = data;
        var result = _validator.Validate(_request);
        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Should_Error_Result_When_Miss_Url(string data)
    {
        _request.Url = data;
        var result = _validator.Validate(_request);
        Assert.False(result.IsValid);
    }
}