using System.Text.Json;
using KnowledgeSpace.BackendServer.Constants;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace KnowledgeSpace.BackendServer.Authorization;

public class ClaimRequirementFilter(FunctionCode functionCode, CommandCode commandCode): IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var permissionsClaim = context.HttpContext.User.Claims
            .SingleOrDefault(c => c.Type == SystemConstants.Claims.Permissions);
        if (permissionsClaim is null)
        {
            context.Result = new ForbidResult();
        }

        var permissions = JsonSerializer.Deserialize<List<string>>(permissionsClaim!.Value);
        if (permissions is not null && !permissions.Contains(functionCode + "_" + commandCode))
        {
            context.Result = new ForbidResult();
        }
    }
}
