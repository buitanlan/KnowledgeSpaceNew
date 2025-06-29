using KnowledgeSpace.BackendServer.Controllers;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace KnowledgeSpace.BackendServer.UnitTest.Controllers;

public class FunctionsControllerTest
{
    private readonly ApplicationDbContext _context = new InMemoryDbContextFactory().GetApplicationDbContext();

    // _context.Functions.AddRange(new List<Function>
    // {
    //     new()
    //     {
    //         Id = "test1",
    //         ParentId = null,
    //         Name = "test1",
    //         SortOrder = 1 ,
    //         Url = "/te"
    //     },
    //     new()
    //     {
    //         Id = "test2",
    //         ParentId = null,
    //         Name = "test2",
    //         SortOrder = 2 ,
    //         Url = "/te"
    //     },
    //     new()
    //     {
    //         Id = "test3",
    //         ParentId = null,
    //         Name = "test3",
    //         SortOrder = 3 ,
    //         Url = "/te"
    //     },
    //     new()
    //     {
    //         Id = "test4",
    //         ParentId = null,
    //         Name = "test4",
    //         SortOrder = 4,
    //         Url = "/te"
    //     },
    // });
    // _context.SaveChangesAsync().ConfigureAwait(true);

    [Fact]
    public void ShouldCreateInstance_NotNull_Success()
    {
        var controller = new FunctionsController(_context);
        Assert.NotNull(controller);
            
    }


    [Fact]
    public async Task PostFunction_ValidInput_Success()
    {
        var usersController = new FunctionsController(_context);
        var result = await usersController.PostFunction(new FunctionCreateRequest
        {
            Id = "PostFunction_ValidInput_Success",
            ParentId = null,
            Name = "PostFunction_ValidInput_Success",
            SortOrder = 5,
            Url = "/PostFunction_ValidInput_Success"
        });

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task PostUser_ValidInput_Failed()
    {
        _context.Functions.AddRange(
        [
            new()
            {
                Id = "PostUser_ValidInput_Failed",
                ParentId = null,
                Name = "PostUser_ValidInput_Failed",
                SortOrder = 1,
                Url = "/PostUser_ValidInput_Failed"
            }
        ]);

    await _context.SaveChangesAsync();
        var functionsController = new FunctionsController(_context);

        var result = await functionsController.PostFunction(new FunctionCreateRequest
        {
            Id = "PostUser_ValidInput_Failed",
            ParentId = null,
            Name = "PostUser_ValidInput_Failed",
            SortOrder = 5,
            Url = "/PostUser_ValidInput_Failed"
        });

        Assert.IsType<BadRequestObjectResult>(result);
    }
        
    [Fact]
    public async Task GetFunction_HasData_ReturnSuccess()
    {
        _context.Functions.AddRange(
        [
            new(){
                Id = "GetFunction_HasData_ReturnSuccess",
                ParentId = null,
                Name = "GetFunction_HasData_ReturnSuccess",
                SortOrder =1,
                Url ="/GetFunction_HasData_ReturnSuccess"
            }
        ]);

        await _context.SaveChangesAsync();
        var functionsController = new FunctionsController(_context);
        var result = await functionsController.GetFunctions();
        if (result is OkObjectResult okResult)
        {
            var functionVms = okResult.Value as IEnumerable<FunctionVm>;
            Assert.True((functionVms ?? Array.Empty<FunctionVm>()).Any());
        }
    }

    // [Fact]
    // public async Task GetFunctionsPaging_NoFilter_ReturnSuccess()
    // {
    //     _context.Functions.AddRange(new List<Function>()
    //     {
    //         new Function(){
    //             Id = "GetFunctionsPaging_NoFilter_ReturnSuccess1",
    //             ParentId = null,
    //             Name = "GetFunctionsPaging_NoFilter_ReturnSuccess1",
    //             SortOrder =1,
    //             Url ="/test1"
    //         },
    //          new Function(){
    //             Id = "GetFunctionsPaging_NoFilter_ReturnSuccess2",
    //             ParentId = null,
    //             Name = "GetFunctionsPaging_NoFilter_ReturnSuccess2",
    //             SortOrder =2,
    //             Url ="/test2"
    //         },
    //           new Function(){
    //             Id = "GetFunctionsPaging_NoFilter_ReturnSuccess3",
    //             ParentId = null,
    //             Name = "GetFunctionsPaging_NoFilter_ReturnSuccess3",
    //             SortOrder = 3,
    //             Url ="/test3"
    //         },
    //            new Function(){
    //             Id = "GetFunctionsPaging_NoFilter_ReturnSuccess4",
    //             ParentId = null,
    //             Name = "GetFunctionsPaging_NoFilter_ReturnSuccess4",
    //             SortOrder =4,
    //             Url ="/test4"
    //         }
    //     });
    //     await _context.SaveChangesAsync();
    //     var functionsController = new FunctionsController(_context);
    //     var result = await functionsController.GetFunctionsPaging(null, 1, 2);
    //     var okResult = result as OkObjectResult;
    //     var UserVms = okResult.Value as Pagination<FunctionVm>;
    //     Assert.Equal(4, UserVms.TotalRecords);
    //     Assert.Equal(2, UserVms.Items.Count);
    // }
    //
    // [Fact]
    // public async Task GetUsersPaging_HasFilter_ReturnSuccess()
    // {
    //     _context.Functions.AddRange(new List<Function>()
    //     {
    //         new Function(){
    //             Id = "GetUsersPaging_HasFilter_ReturnSuccess",
    //             ParentId = null,
    //             Name = "GetUsersPaging_HasFilter_ReturnSuccess",
    //             SortOrder = 3,
    //             Url ="/GetUsersPaging_HasFilter_ReturnSuccess"
    //         }
    //     });
    //     await _context.SaveChangesAsync();
    //
    //     var functionsController = new FunctionsController(_context);
    //     var result = await functionsController.GetFunctionsPaging("GetUsersPaging_HasFilter_ReturnSuccess", 1, 2);
    //     var okResult = (OkObjectResult) result;
    //     var UserVms = okResult.Value as Pagination<FunctionVm>;
    //     Assert.Equal(1, UserVms.TotalRecords);
    //     Assert.Single(UserVms.Items);
    // }

    [Fact]
    public async Task GetById_HasData_ReturnSuccess()
    {
        _context.Functions.AddRange(
        [
            new(){
                Id = "GetById_HasData_ReturnSuccess",
                ParentId = null,
                Name = "GetById_HasData_ReturnSuccess",
                SortOrder =1,
                Url ="/GetById_HasData_ReturnSuccess"
            }
        ]);
        await _context.SaveChangesAsync();
        var functionsController = new FunctionsController(_context);
        var result = await functionsController.GetById("GetById_HasData_ReturnSuccess");
        var okResult = result as OkObjectResult;
        Assert.NotNull(okResult);

        if (okResult.Value is FunctionVm functionVms)
        {
            Assert.Equal("GetById_HasData_ReturnSuccess", functionVms.Id);
        }
    }

    [Fact]
    public async Task PutUser_ValidInput_Success()
    {
        _context.Functions.AddRange(
        [
            new(){
                Id = "PutUser_ValidInput_Success",
                ParentId = null,
                Name = "PutUser_ValidInput_Success",
                SortOrder =1,
                Url ="/PutUser_ValidInput_Success"
            }
        ]);
        await _context.SaveChangesAsync();
        var functionsController = new FunctionsController(_context);
        var result = await functionsController.PutFunction("PutUser_ValidInput_Success", new FunctionCreateRequest
        {
            ParentId = null,
            Name = "PutUser_ValidInput_Success updated",
            SortOrder = 6,
            Url = "/PutUser_ValidInput_Success"
        });
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task PutUser_ValidInput_Failed()
    {
        var functionsController = new FunctionsController(_context);

        var result = await functionsController.PutFunction("PutUser_ValidInput_Failed", new FunctionCreateRequest
        {
            ParentId = null,
            Name = "PutUser_ValidInput_Failed update",
            SortOrder = 6,
            Url = "/PutUser_ValidInput_Failed"
        });
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteUser_ValidInput_Success()
    {
        _context.Functions.AddRange(
        [
            new(){
                Id = "DeleteUser_ValidInput_Success",
                ParentId = null,
                Name = "DeleteUser_ValidInput_Success",
                SortOrder =1,
                Url ="/DeleteUser_ValidInput_Success"
            }
        ]);

        await _context.SaveChangesAsync();
        var functionsController = new FunctionsController(_context);
        var result = await functionsController.DeleteFunction("DeleteUser_ValidInput_Success");
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task DeleteUser_ValidInput_Failed()
    {
        var functionsController = new FunctionsController(_context);
        var result = await functionsController.DeleteFunction("DeleteUser_ValidInput_Failed");
        Assert.IsType<NotFoundResult>(result);
    }
        
}
