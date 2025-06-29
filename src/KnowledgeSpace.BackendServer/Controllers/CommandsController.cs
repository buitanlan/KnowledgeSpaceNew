using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.ViewModels.Systems;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public class CommandsController(ApplicationDbContext context) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetCommands()
    {
        var commandVms = await context.Commands
            .Select(c => new CommandVm
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();
        return Ok(commandVms);
    }

}