using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public class RolesController(RoleManager<IdentityRole> roleManager, ApplicationDbContext context) : BaseController
{
    [HttpPost]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.Create)]
    public async Task<IActionResult> PostRole(RoleCreateRequest request)
    {
        var role = new IdentityRole
        {
            Id = request.Id,
            Name = request.Name,
            NormalizedName = request.Name.ToUpper()
        };
        var result = await roleManager.CreateAsync(role);
        if(result.Succeeded)
        {
            return CreatedAtAction(nameof(GetById), new {id = role.Id}, request);
        }
        return BadRequest(new ApiBadRequestResponse(result));
    }


    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {

        var roleVms = await roleManager.Roles
            .AsNoTracking()
            .Select(r => new RoleVm
            {
                Id = r.Id,
                Name = r.Name
            }).
            ToListAsync();
        return Ok(roleVms);
    }


    [HttpGet("filter")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.View)]
    public async Task<ActionResult<Pagination<RoleVm>>> GetRolesPaging(string keyword, int pageSize, int pageIndex)
    {
        var query = roleManager.Roles;
        if( !string.IsNullOrEmpty(keyword))
        {
            query = query.Where(x => x.Id.Contains(keyword) || x.Name.Contains(keyword));
        }

        var totalRecords = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new RoleVm
            {
                Id = x.Id,
                Name = x.Name
            }).ToListAsync();

        var pagination = new Pagination<RoleVm>
        {
            Items = items,
            TotalRecords = totalRecords
        };
        return Ok(pagination);
    }



    [HttpGet("{id}")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.View)]
    public async Task<IActionResult> GetById(string id)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound(new ApiNotFoundResponse($"Cannot find role with id: {id}"));
        var roleVm = new RoleVm
        {
            Id = role.Id,
            Name = role.Name
        };
        return Ok(roleVm);
    }


    [HttpPut("{id}")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.Update)]
    [ApiValidationFilter]
    public async Task<IActionResult> PutRole(string id, [FromBody] RoleCreateRequest roleVm) 
    {
        if(id  != roleVm.Id) return BadRequest(new ApiBadRequestResponse("Role id not match"));

        var role = await roleManager.FindByIdAsync(id);
        if(role is null) return NotFound(new ApiNotFoundResponse($"Cannot find role with id: {id}"));

        role.Name = roleVm.Name;
        role.NormalizedName = roleVm.Name.ToUpper();

        var result = await roleManager.UpdateAsync(role);

        if (result.Succeeded) return NoContent();
        return BadRequest(new ApiBadRequestResponse(result));
    }


    [HttpDelete("{id}")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.Delete)]
    public async Task<IActionResult> DeleteRole(string id)
    {
        var role = await roleManager.FindByIdAsync(id);
        if (role is null) return NotFound(new ApiNotFoundResponse($"Cannot find role with id: {id}"));

        var result = await roleManager.DeleteAsync(role);

        if (result.Succeeded) 
        {
            var roleVm = new RoleVm
            {
                Id = role.Id,
                Name = role.Name
            };
            return Ok(roleVm);
        }
        return BadRequest(new ApiBadRequestResponse(result));
    }
        
        
    [HttpGet("{roleId}/permissions")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.View)]
    [ApiValidationFilter]
    public async Task<IActionResult> GetPermissionByRoleId(string roleId)
    {
        var permissions = from p in context.Permissions

            join a in context.Commands
                on p.CommandId equals a.Id
            where p.RoleId == roleId
            select new PermissionVm
            {
                FunctionId = p.FunctionId,
                CommandId = p.CommandId,
                RoleId = p.RoleId
            };

        return Ok(await permissions.ToListAsync());
    }

    [HttpPut("{roleId}/permissions")]
    [ClaimRequirement(FunctionCode.SystemRole, CommandCode.View)]
    public async Task<IActionResult> PutPermissionByRoleId(string roleId, [FromBody] UpdatePermissionRequest request)
    {
        //create new permission list from user changed
        var newPermissions = request.Permissions.Select(p => new Permission(p.FunctionId, roleId, p.CommandId)).ToList();

        var existingPermissions = context.Permissions.Where(x => x.RoleId == roleId);
        context.Permissions.RemoveRange(existingPermissions);
        context.Permissions.AddRange(newPermissions.Distinct(new MyPermissionComparer()));
        var result = await context.SaveChangesAsync();
        if (result > 0)
        {
            return NoContent();
        }
        return BadRequest(new ApiBadRequestResponse("Save permission failed"));
    }


}

internal class MyPermissionComparer : IEqualityComparer<Permission>
{
    // Items are equal if their ids are equal.
    public bool Equals(Permission x, Permission y)
    {
        // Check whether the compared objects reference the same data.
        if (ReferenceEquals(x, y)) return true;

        // Check whether any of the compared objects is null.
        if (ReferenceEquals(x, null) || ReferenceEquals(y, null))
            return false;

        //Check whether the items properties are equal.
        return x.CommandId == y.CommandId && x.FunctionId == y.FunctionId && x.RoleId == y.RoleId;
    }

    // If Equals() returns true for a pair of objects
    // then GetHashCode() must return the same value for these objects.

    public int GetHashCode(Permission permission)
    {
        //Check whether the object is null
        if (ReferenceEquals(permission, null)) return 0;

        //Get hash code for the ID field.
        var hashProductId = (permission.CommandId + permission.FunctionId + permission.RoleId).GetHashCode();

        return hashProductId;
    }
}
