using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public class CategoriesController(ApplicationDbContext context) : BaseController
{
    [HttpPost]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.Create)]
    [ApiValidationFilter]
    public async Task<IActionResult> PostCategory([FromBody] CategoryCreateRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder,
            SeoAlias = request.SeoAlias,
            SeoDescription = request.SeoDescription
        };
        context.Categories.Add(category);
        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, request);
        }
        return BadRequest(new ApiBadRequestResponse("Create category failed"));
    }

        
    [HttpGet]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.View)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await context.Categories.AsNoTracking().ToListAsync();
        var categoryVms = categories.Select(CreateCategoryVm).ToList();
        return Ok(categoryVms);
    }

        
    [HttpGet("filter")]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.View)]
    public async Task<IActionResult> GetCategoriesPaging(string filter, int pageIndex, int pageSize)
    {
        var query = context.Categories.AsQueryable();
        if (!string.IsNullOrEmpty(filter))
        {
            query = query.Where(x => x.Name.Contains(filter)
                                     || x.Name.Contains(filter));
        }
        var totalRecords = await query.CountAsync();
        var items = await query
            .AsNoTracking()
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = items.Select(CreateCategoryVm).ToList();

        var pagination = new Pagination<CategoryVm>
        {
            Items = data,
            TotalRecords = totalRecords,
        };
        return Ok(pagination);
    }
        

    [HttpGet("{id:int}")]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.View)]
    [ApiValidationFilter]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await context.Categories.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);
        if (category is null)
            return NotFound(new ApiNotFoundResponse($"Category with id: {id} is not found"));

        var categoryVm = CreateCategoryVm(category);
        return Ok(categoryVm);
    }

        
    [HttpPut("{id}")]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.Update)]
    [ApiValidationFilter]
    public async Task<IActionResult> PutCategory(int id, [FromBody]CategoryCreateRequest request)
    {
        var category = await context.Categories.SingleOrDefaultAsync(x => x.Id == id);
        if (category is null)
            return NotFound();

        if (id == request.ParentId)
        {
            return BadRequest(new ApiBadRequestResponse("Category cannot be a child itself."));
        }

        category.Name = request.Name;
        category.ParentId = request.ParentId;
        category.SortOrder = request.SortOrder;
        category.SeoDescription = request.SeoDescription;
        category.SeoAlias = request.SeoAlias;

        context.Categories.Update(category);
        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return NoContent();
        }
        return BadRequest(new ApiBadRequestResponse("Update category failed"));
    }

        
    [HttpDelete("{id}")]
    [ClaimRequirement(FunctionCode.ContentCategory, CommandCode.Delete)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await context.Categories.SingleOrDefaultAsync(x => x.Id == id);
        if (category is null)
            return NotFound();

        context.Categories.Remove(category);
        var result = await context.SaveChangesAsync();
        if (result <= 0) return BadRequest(new ApiNotFoundResponse($"Category with id: {id} is not found"));
        var categoryVm = CreateCategoryVm(category);
        return Ok(categoryVm);
    }

    private static CategoryVm CreateCategoryVm(Category category)
    {
        return new CategoryVm
        {
            Id = category.Id,
            Name = category.Name,
            SortOrder = category.SortOrder,
            ParentId = category.ParentId,
            NumberOfTickets = category.NumberOfTickets,
            SeoDescription = category.SeoDescription,
            SeoAlias = category.SeoDescription
        };
    }
}
