using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public class PermissionsController(ApplicationDbContext dbContext) : BaseController
{
    [HttpGet]
    [ClaimRequirement(FunctionCode.SystemPermission, CommandCode.View)]
    public async Task<IActionResult> GetCommandViews()
    {
        const string sql = """
                           select f."Id",
                                  f."Name",
                                  f."ParentId",
                                  sum(case when sa."Id" = 'Create' then 1 else 0 end) > 0 as HasCreate,
                                  sum(case when sa."Id" = 'Update' then 1 else 0 end) > 0 as HasUpdate,
                                  sum(case when sa."Id" = 'Delete' then 1 else 0 end) > 0 as HasDelete,
                                  sum(case when sa."Id" = 'View' then 1 else 0 end) > 0 as HasView,
                                  sum(case when sa."Id" = 'Approve' then 1 else 0 end) > 0 as HasApprove
                           from "Functions" f
                               join "CommandInFunctions" cif on f."Id" = cif."FunctionId"
                               left join "Commands" sa on cif."CommandId" = sa."Id"
                           group by f."Id", f."Name", f."ParentId"
                           order by f."ParentId";
                           """;
        var result = await dbContext.Database.SqlQueryRaw<PermissionScreenVm>(sql).ToListAsync();
        return Ok(result);
    }
}
