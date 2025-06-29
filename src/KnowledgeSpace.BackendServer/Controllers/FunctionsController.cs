using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public class FunctionsController(ApplicationDbContext context) : BaseController
{
    [HttpPost]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.Create)]
    [ApiValidationFilter]
    public async Task<IActionResult> PostFunction([FromBody]FunctionCreateRequest  request)
    {
        var dbFunction = await context.Functions.SingleOrDefaultAsync(x => x.Id == request.Id);
        if (dbFunction is not null)
            return BadRequest(new ApiBadRequestResponse($"Function with id {request.Id} is existed!"));
            
        var function = new Function
        {
            Id = request.Id,
            Name = request.Name,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder,
            Url = request.Url,
            Icon = request.Icon
        };
        await context.Functions.AddAsync(function);
        var result = await context.SaveChangesAsync();
            
        if(result > 0)
        {
            return CreatedAtAction(nameof(GetById), new {id = function.Id}, request);
        }
        return BadRequest(new ApiBadRequestResponse("Create function is failed"));
    }


    [HttpGet]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.View)]
    public async Task<IActionResult> GetFunctions()
    {
        var functionVms = await context.Functions
            .Select(u => new FunctionVm
            {
                Id = u.Id,
                Name = u.Name,
                Url = u.Url,
                SortOrder = u.SortOrder,
                ParentId = u.ParentId,
                Icon = u.Icon
            })
            .ToListAsync();
        return Ok(functionVms);
    }



    [HttpGet("{functionId}/parents")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.View)]
    public async Task<IActionResult> GetFunctionsByParentId(string functionId)
    {
        var functions = context.Functions.Where(x => x.ParentId == functionId);

        var functionvms = await functions.Select(u => new FunctionVm()
        {
            Id = u.Id,
            Name = u.Name,
            Url = u.Url,
            SortOrder = u.SortOrder,
            ParentId = u.ParentId,
            Icon = u.Icon
        }).ToListAsync();

        return Ok(functionvms);
    }


    [HttpGet("filter")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.View)]
    public async Task<ActionResult<Pagination<RoleVm>>> GetFunctionsPaging(string filter, int pageSize, int pageIndex)
    {
        var query = context.Functions.AsQueryable();
        if( !string.IsNullOrEmpty(filter))
        {
            query = query.Where(x => 
                x.Name.Contains(filter) || x.Id.Contains(filter) || x.Url.Contains(filter));
        }

        var totalRecords = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new FunctionVm
            {
                Id = u.Id,
                Name = u.Name,
                Url = u.Url,
                SortOrder = u.SortOrder,
                ParentId = u.ParentId,
                Icon = u.Icon
            })
            .ToListAsync();

        var pagination = new Pagination<FunctionVm>
        {
            Items = items,
            TotalRecords = totalRecords
        };
        return Ok(pagination);
    }



    [HttpGet("{id}")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.View)]
    public async Task<IActionResult> GetById(string id)
    {
        var function = await context.Functions.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);
        if (function is null) return NotFound(new ApiNotFoundResponse($"Cannot found function with id {id}"));
        var functionVm = new FunctionVm
        {
            Id = function.Id,
            Name = function.Name,
            Url = function.Url,
            SortOrder = function.SortOrder,
            ParentId = function.ParentId
        };
        return Ok(functionVm);
    }


    [HttpPut("{id}")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.Update)]
    public async Task<IActionResult> PutFunction(string id, [FromBody] FunctionCreateRequest request)
    {
        var function = await context.Functions.SingleOrDefaultAsync(x => x.Id == id);
        if(function is null) return NotFound(new ApiNotFoundResponse($"Cannot found function with id {id}"));

        function.Name = request.Name;
        function.ParentId = request.ParentId;
        function.SortOrder = request.SortOrder;
        function.Url = request.Url;
        function.Icon = request.Icon;
        
        context.Functions.Update(function);
        var result = await context.SaveChangesAsync();

        if (result > 0) return NoContent();
        return BadRequest();
    }


    [HttpDelete("{id}")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.Delete)]
    public async Task<IActionResult> DeleteFunction(string id)
    {
        var function = await context.Functions.SingleOrDefaultAsync(x => x.Id == id);
        if (function is null)
            return NotFound(new ApiNotFoundResponse($"Cannot found function with id {id}"));

        context.Functions.Remove(function);
        var commands = context.CommandInFunctions.Where(x => x.FunctionId == id);
        context.CommandInFunctions.RemoveRange(commands);
        var result = await context.SaveChangesAsync();

        if (result <= 0)
            return BadRequest(new ApiBadRequestResponse("Delete function failed"));

        var functionVm = new FunctionVm
        {
            Id = function.Id,
            Name = function.Name,
            Url = function.Url,
            SortOrder = function.SortOrder,
            ParentId = function.ParentId,
            Icon = function.Icon
        };
        return Ok(functionVm);
    }
        
        
    [HttpGet("{functionId}/commands")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.View)]
    public async Task<IActionResult> GetCommandsInFunction(string functionId)
    {
        var query =
            from c in context.Commands
            join cif in context.CommandInFunctions on c.Id equals cif.CommandId into result1
            from commandInFunction in result1.DefaultIfEmpty()
            join f in context.Functions on commandInFunction.FunctionId equals f.Id into result2
            from function in result2.DefaultIfEmpty()
            select new
            {
                c.Id,
                c.Name,
                commandInFunction.FunctionId
            };
        query = query.Where(x => x.FunctionId == functionId);
        var data = await query
            .Select(x => new CommandVm
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync();
        return Ok(data);
    }


    [HttpPost("{functionId}/commands")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.Create)]
    [ApiValidationFilter]
    public async Task<IActionResult> PostCommandToFunction(string functionId, [FromBody] CommandAssignRequest request)
    {
        foreach (var commandId in request.CommandIds)
        {
            if (await context.CommandInFunctions.FindAsync(commandId, functionId) != null)
                return BadRequest(new ApiBadRequestResponse("This command has been existed in function"));
            var entity = new CommandInFunction()
            {
                CommandId = commandId,
                FunctionId = functionId
            };

            context.CommandInFunctions.Add(entity);
        }

        if (request.AddToAllFunctions)
        {
            var otherFunctions = context.Functions.Where(x => x.Id != functionId);
            foreach (var function in otherFunctions)
            {
                foreach (var commandId in request.CommandIds)
                {
                    if (await context.CommandInFunctions.FindAsync(request.CommandIds, function.Id) == null)
                    {
                        context.CommandInFunctions.Add(new CommandInFunction()
                        {
                            CommandId = commandId,
                            FunctionId = function.Id
                        });
                    }
                }
            }
        }
        var result = await context.SaveChangesAsync();

        return result switch
        {
            > 0 => CreatedAtAction(nameof(GetById), new { request.CommandIds, functionId }),
            _ => BadRequest(new ApiBadRequestResponse("Add command to function failed"))
        };
    }


    [HttpDelete("{functionId}/commands")]
    [ClaimRequirement(FunctionCode.SystemFunction, CommandCode.Update)]
    [ApiValidationFilter]
    public async Task<IActionResult> DeleteCommandToFunction(string functionId, [FromQuery] CommandAssignRequest request)
    {
        foreach (var commandId in request.CommandIds)
        {
            var entity = await context.CommandInFunctions
                .SingleOrDefaultAsync(x => x.FunctionId == functionId && x.CommandId == commandId);
            if (entity is null)
                return BadRequest(new ApiBadRequestResponse("This command is not existed in function"));

            context.CommandInFunctions.Remove(entity);
        }

        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return Ok();
        }
        return BadRequest(new ApiBadRequestResponse("Delete command to function failed"));
    }
}
