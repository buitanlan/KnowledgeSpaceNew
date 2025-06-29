using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Extensions;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.BackendServer.Services;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public partial class KnowledgeBasesController
    (ApplicationDbContext context, 
    IStorageService storageService) : BaseController
{

    [HttpPost]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.Create)]
    [ApiValidationFilter]
    public async Task<IActionResult> PostKnowledgeBase([FromForm] KnowledgeBaseCreateRequest request)
    {
        var knowledgeBase = CreateKnowledgeBaseEntity(request);
        knowledgeBase.OwnerUserId = User.GetUserId();
        if (string.IsNullOrEmpty(knowledgeBase.SeoAlias))
        {
            knowledgeBase.SeoAlias = TextHelper.ToUnsignedString(knowledgeBase.Title);
        }
        // knowledgeBase.Id = await sequenceService.GetKnowledgeBaseNewId();
        if (request?.Attachments?.Count > 0)
        {
            foreach (var attachment in request.Attachments)
            {
                var attachmentEntity = await SaveFile(knowledgeBase.Id, attachment);
                if (attachmentEntity is not null)
                {
                    context.Attachments.Add(attachmentEntity);

                }
            }
        }

        context.KnowledgeBases.Add(knowledgeBase);
        //Process label
        if (request?.Labels is { Length: > 0})
        {
            await ProcessLabel(request, knowledgeBase);
        }
        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return CreatedAtAction(nameof(GetById), new { id = knowledgeBase.Id });
        }
        return BadRequest();
    }
        
        
    private static KnowledgeBase CreateKnowledgeBaseEntity(KnowledgeBaseCreateRequest request)
    {
        var entity =  new KnowledgeBase
        {
            CategoryId = request.CategoryId,
            Title = request.Title,
            SeoAlias = request.SeoAlias,
            Description = request.Description,
            Environment = request.Environment,
            Problem = request.Problem,
            StepToReproduce = request.StepToReproduce,
            ErrorMessage = request.ErrorMessage,
            Workaround = request.Workaround,
            Note = request.Note,
        };
        if (request.Labels.Length > 0)
        {
            entity.Labels = string.Join(',', request.Labels);
        }
        return entity;
    }
        

    private async Task ProcessLabel(KnowledgeBaseCreateRequest request, KnowledgeBase knowledgeBase)
    {
        foreach (var labelText in request.Labels)
        {
            var labelId = TextHelper.ToUnsignedString(labelText);
            var existingLabel = await context.Labels.SingleOrDefaultAsync(x =>x.Id == labelId);
            if (existingLabel is null)
            {
                var labelEntity = new Label
                {
                    Id = labelId,
                    Name = labelText
                };
                context.Labels.Add(labelEntity);
            }
            if (await context.LabelInKnowledgeBases.FindAsync(labelId, knowledgeBase.Id) is null)
            {
                context.LabelInKnowledgeBases.Add(new LabelInKnowledgeBase()
                {
                    KnowledgeBaseId = knowledgeBase.Id,
                    LabelId = labelId
                });
            }
        }
    }


    [HttpGet]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.View)]
    public async Task<IActionResult> GetKnowledgeBases()
    {
        var knowledgeBaseVms = await context.KnowledgeBases
            .AsNoTracking()
            .Select(u => new KnowledgeBaseQuickVm
            {
                Id = u.Id,
                CategoryId = u.CategoryId,
                Description = u.Description,
                SeoAlias = u.SeoAlias,
                Title = u.Title
            })
            .ToListAsync();

        return Ok(knowledgeBaseVms);
    }


    [HttpGet("filter")]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.View)]
    public async Task<IActionResult> GetKnowledgeBasesPaging(string filter, int pageIndex, int pageSize)
    {
        var query = from k in context.KnowledgeBases
                                join c in context.Categories on k.CategoryId equals c.Id
                                select new { k, c };
        if (!string.IsNullOrEmpty(filter))
        {
            query = query.Where(x => x.k.Title.Contains(filter));
        }
        var totalRecords = await query.CountAsync();
        var items = await query
            .AsNoTracking()
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new KnowledgeBaseQuickVm
            {
                Id = u.k.Id,
                CategoryId = u.k.CategoryId,
                Description = u.k.Description,
                SeoAlias = u.k.SeoAlias,
                Title = u.k.Title,
                CategoryName = u.c.Name
            })
            .ToListAsync();

        var pagination = new Pagination<KnowledgeBaseQuickVm>
        {
            Items = items,
            TotalRecords = totalRecords,
        };
        return Ok(pagination);
    }


    private static KnowledgeBaseVm CreateKnowledgeBaseVm(KnowledgeBase knowledgeBase)
    {
        return new KnowledgeBaseVm
        {
            Id = knowledgeBase.CategoryId,
            CategoryId = knowledgeBase.CategoryId,
            Title = knowledgeBase.Title,
            SeoAlias = knowledgeBase.SeoAlias,
            Description = knowledgeBase.Description,
            Environment = knowledgeBase.Environment,
            Problem = knowledgeBase.Problem,
            StepToReproduce = knowledgeBase.StepToReproduce,
            ErrorMessage = knowledgeBase.ErrorMessage,
            Workaround = knowledgeBase.Workaround,
            Note = knowledgeBase.Note,
            OwnerUserId = knowledgeBase.OwnerUserId,
            Labels = !string.IsNullOrEmpty(knowledgeBase.Labels) ? knowledgeBase.Labels.Split(',') : null,
            CreateDate = knowledgeBase.CreateDate,
            LastModifiedDate = knowledgeBase.LastModifiedDate,
            NumberOfComments = knowledgeBase.CategoryId,
            NumberOfVotes = knowledgeBase.CategoryId,
            NumberOfReports = knowledgeBase.CategoryId,
        };
    }


    [HttpGet("{id:int}")]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var knowledgeBase = await context.KnowledgeBases.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id);
        if (knowledgeBase is null)
            return NotFound(new ApiNotFoundResponse($"Cannot found knowledge base with id: {id}"));

        var attachments = await context.Attachments
                .Where(x => x.KnowledgeBaseId == id)
                .Select(x => new AttachmentVm()
                {
                    FileName = x.FileName,
                    FilePath = x.FilePath,
                    FileSize = x.FileSize,
                    Id = x.Id,
                    FileType = x.FileType
                }).ToListAsync();
            var knowledgeBaseVm = CreateKnowledgeBaseVm(knowledgeBase);
            knowledgeBaseVm.Attachments = attachments;
            return Ok(knowledgeBaseVm);
    }


    [HttpPut("{id:int}")]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.Update)]
    [ApiValidationFilter]
    [Consumes("multipart/form-data")]

    public async Task<IActionResult> PutKnowledgeBase(int id, [FromBody] KnowledgeBaseCreateRequest request)
    {
        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == id);
        if (knowledgeBase is null)
            return NotFound(new ApiNotFoundResponse($"Cannot found knowledge base with id {id}"));
        UpdateKnowledgeBase(request, knowledgeBase);

        //Process attachment
        if (request is { Attachments.Count: > 0 })
        {
            foreach (var attachment in request.Attachments)
            {
                var attachmentEntity = await SaveFile(knowledgeBase.Id, attachment);
                if (attachmentEntity is not null)
                {
                    context.Attachments.Add(attachmentEntity);
                }
            }
        }
        context.KnowledgeBases.Update(knowledgeBase);
        if (request.Labels is { Length: > 0})
        {
            await ProcessLabel(request, knowledgeBase);
        }
        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return NoContent();
        }
        return BadRequest(new ApiBadRequestResponse("Update knowledge base failed"));
    }


    [HttpDelete("{id}")]
    [ClaimRequirement(FunctionCode.ContentKnowledgeBase,CommandCode.Delete)]
    public async Task<IActionResult> DeleteKnowledgeBase(int id)
    {
        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == id);
        if (knowledgeBase is null)
            return NotFound(new ApiNotFoundResponse($"Cannot find knowledge base with {id}"));

        context.KnowledgeBases.Remove(knowledgeBase);
        var result = await context.SaveChangesAsync();
        if (result <= 0) return BadRequest(new ApiBadRequestResponse("Cannot delete this knowledge Base"));
        var knowledgeBaseVm = CreateKnowledgeBaseVm(knowledgeBase);
        return Ok(knowledgeBaseVm);
    }
        
    private static void UpdateKnowledgeBase(KnowledgeBaseCreateRequest request, KnowledgeBase knowledgeBase)
    {
        knowledgeBase.CategoryId = request.CategoryId;
        knowledgeBase.Title = request.Title;
        knowledgeBase.SeoAlias = request.SeoAlias;
        knowledgeBase.Description = request.Description;
        knowledgeBase.Environment = request.Environment;
        knowledgeBase.Problem = request.Problem;
        knowledgeBase.StepToReproduce = request.StepToReproduce;
        knowledgeBase.ErrorMessage = request.ErrorMessage;
        knowledgeBase.Workaround = request.Workaround;
        knowledgeBase.Note = request.Note;
        knowledgeBase.Labels = string.Join(',', request.Labels);
    }
}
