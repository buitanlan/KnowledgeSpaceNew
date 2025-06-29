using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public partial class KnowledgeBasesController
{
    #region Reports

    [HttpGet("{knowledgeBaseId:int}/reports/filter")]
    public async Task<IActionResult> GetReportsPaging(int knowledgeBaseId, string filter, int pageIndex, int pageSize)
    {
        var query = context.Reports.Where(x => x.KnowledgeBaseId == knowledgeBaseId).AsQueryable();
        if (!string.IsNullOrEmpty(filter))
        {
            query = query.Where(x => x.Content.Contains(filter));
        }
        var totalRecords = await query.CountAsync();
        var items = await query
            .AsNoTracking()
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ReportVm
            {
                Id = c.Id,
                Content = c.Content,
                CreateDate = c.CreateDate,
                KnowledgeBaseId = c.KnowledgeBaseId,
                LastModifiedDate = c.LastModifiedDate,
                IsProcessed = false,
                ReportUserId = c.ReportUserId
            })
            .ToListAsync();

        var pagination = new Pagination<ReportVm>
        {
            Items = items,
            TotalRecords = totalRecords,
        };
        return Ok(pagination);
    }

    [HttpGet("{knowledgeBaseId:int}/reports/{reportId:int}")]
    public async Task<IActionResult> GetReportDetail(int knowledgeBaseId, int reportId)
    {
        var report = await context.Reports.AsNoTracking().SingleOrDefaultAsync(x => x.Id == reportId);
        if (report is null)
            return NotFound();

        var reportVm = new ReportVm
        {
            Id = report.Id,
            Content = report.Content,
            CreateDate = report.CreateDate,
            KnowledgeBaseId = report.KnowledgeBaseId,
            LastModifiedDate = report.LastModifiedDate,
            IsProcessed = report.IsProcessed,
            ReportUserId = report.ReportUserId
        };

        return Ok(reportVm);
    }

    [HttpPost("{knowledgeBaseId}/reports")]
    [ApiValidationFilter]
    public async Task<IActionResult> PostReport(int knowledgeBaseId, [FromBody] ReportCreateRequest request)
    {
        var report = new Report
        {
            Content = request.Content,
            KnowledgeBaseId = knowledgeBaseId,
            ReportUserId = request.ReportUserId,
            IsProcessed = false
        };
        context.Reports.Add(report);

        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == knowledgeBaseId);
        if (knowledgeBase is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found knowledge base with id {knowledgeBaseId}"));
        knowledgeBase.NumberOfComments = knowledgeBase.NumberOfReports.GetValueOrDefault(0) + 1;
        context.KnowledgeBases.Update(knowledgeBase);

        var result = await context.SaveChangesAsync();
        if (result > 0)
        {
            return Ok();
        }
        return BadRequest(new ApiBadRequestResponse("Create report failed"));
    }

    [HttpPut("{knowledgeBaseId}/reports/{reportId}")]
    [ApiValidationFilter]
    public async Task<IActionResult> PutReport(int reportId, [FromBody] CommentCreateRequest request)
    {
        var report = await context.Reports.SingleOrDefaultAsync(x => x.Id == reportId);
        if (report is null)
            return BadRequest(new ApiNotFoundResponse($"Cannot found report with id {reportId}"));
        if (User.Identity != null && report.ReportUserId != User.Identity.Name)
            return Forbid();

        report.Content = request.Content;
        context.Reports.Update(report);

        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return NoContent();
        }
        return BadRequest(new ApiBadRequestResponse("Update report failed"));
    }

    [HttpDelete("{knowledgeBaseId}/reports/{reportId}")]
    public async Task<IActionResult> DeleteReport(int knowledgeBaseId, int reportId)
    {
        var report = await context.Reports.SingleOrDefaultAsync(x => x.Id == reportId);
        if (report is null)
            return NotFound();

        context.Reports.Remove(report);

        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == knowledgeBaseId);
        if (knowledgeBase is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found report with id {reportId}"));
        knowledgeBase.NumberOfComments = knowledgeBase.NumberOfReports.GetValueOrDefault(0) - 1;
        context.KnowledgeBases.Update(knowledgeBase);

        var result = await context.SaveChangesAsync();
        if (result > 0)
        {
            return Ok();
        }
        return BadRequest(new ApiBadRequestResponse("Delete report failed"));
    }

    #endregion Reports
}
