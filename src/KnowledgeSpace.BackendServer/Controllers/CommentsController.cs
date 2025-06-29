using KnowledgeSpace.BackendServer.Authorization;
using KnowledgeSpace.BackendServer.Constants;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public partial class KnowledgeBasesController
{
    #region Comments

    [HttpGet("{knowledgeBaseId:int}/comments/filter")]
    [ClaimRequirement(FunctionCode.ContentComment, CommandCode.View)]
    public async Task<IActionResult> GetCommentsPaging(int? knowledgeBaseId, string filter, int pageIndex, int pageSize)
    {
        var query = context.Comments.Where(x => x.KnowledgeBaseId == knowledgeBaseId).AsQueryable();
        if (!string.IsNullOrEmpty(filter))
        {
            query = query.Where(x => x.Content.Contains(filter));
        }
        var totalRecords = await query.CountAsync();
        var items = await query
            .AsNoTracking()
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CommentVm
            {
                Id = c.Id,
                Content = c.Content,
                CreateDate = c.CreateDate,
                KnowledgeBaseId = c.KnowledgeBaseId,
                LastModifiedDate = c.LastModifiedDate,
                OwnerUserId = c.OwnerUserId
            })
            .ToListAsync();

        var pagination = new Pagination<CommentVm>
        {
            Items = items,
            TotalRecords = totalRecords,
        };
        return Ok(pagination);
    }
        

    [HttpGet("{knowledgeBaseId:int}/comments/{commentId:int}")]
    [ClaimRequirement(FunctionCode.ContentComment, CommandCode.View)]
    public async Task<IActionResult> GetCommentDetail(int commentId, int knowledgeBaseId)
    {
        var comment = await context.Comments.AsNoTracking().SingleOrDefaultAsync(x => x.Id == commentId);
        if (comment is null)
            return NotFound(new ApiNotFoundResponse($"Cannot found comment with id: {commentId}"));

        var commentVm = new CommentVm
        {
            Id = comment.Id,
            Content = comment.Content,
            CreateDate = comment.CreateDate,
            KnowledgeBaseId = comment.KnowledgeBaseId,
            LastModifiedDate = comment.LastModifiedDate,
            OwnerUserId = comment.OwnerUserId
        };

        return Ok(commentVm);
    }

        
    [HttpPost("{knowledgeBaseId:int}/comments")]
    [ClaimRequirement(FunctionCode.ContentComment, CommandCode.Create)]
    public async Task<IActionResult> PostComment(int knowledgeBaseId, [FromBody] CommentCreateRequest request)
    {
        var comment = new Comment
        {
            Content = request.Content,
            KnowledgeBaseId = request.KnowledgeBaseId,
            OwnerUserId = string.Empty,
        };
        context.Comments.Add(comment);

        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == knowledgeBaseId);
        if (knowledgeBase is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found knowledge base with id: {knowledgeBaseId}"));
        knowledgeBase.NumberOfComments = knowledgeBase.NumberOfVotes.GetValueOrDefault(0) + 1;
        context.KnowledgeBases.Update(knowledgeBase);

        var result = await context.SaveChangesAsync();
        if (result > 0)
        {
            return CreatedAtAction(nameof(GetCommentDetail), new { id = knowledgeBaseId, commentId = comment.Id }, request);
        }

        return BadRequest(new ApiBadRequestResponse("Create comment failed"));
    }

        
    [HttpPut("{knowledgeBaseId:int}/comments/{commentId:int}")]
    [ClaimRequirement(FunctionCode.ContentComment, CommandCode.Update)]
    public async Task<IActionResult> PutComment(int commentId, [FromBody] CommentCreateRequest request, int knowledgeBaseId)
    {
        var comment = await context.Comments.SingleOrDefaultAsync(x => x.Id == commentId);
        if (comment is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found comment with id: {commentId}"));
        if (User.Identity != null && comment.OwnerUserId != User.Identity.Name)
            return Forbid();

        comment.Content = request.Content;
        context.Comments.Update(comment);

        var result = await context.SaveChangesAsync();

        if (result > 0)
        {
            return NoContent();
        }
        return BadRequest(new ApiBadRequestResponse("Update comment failed"));
    }

        
    [HttpDelete("{knowledgeBaseId}/comments/{commentId}")]
    [ClaimRequirement(FunctionCode.ContentComment, CommandCode.Delete)]
    public async Task<IActionResult> DeleteComment(int knowledgeBaseId, int commentId)
    {

        var comment = await context.Comments.SingleOrDefaultAsync(x => x.Id == commentId);
        if (comment is null)
            return NotFound(new ApiNotFoundResponse($"Cannot found the comment with id: {commentId}"));

        context.Comments.Remove(comment);

        var knowledgeBase = await context.KnowledgeBases.SingleOrDefaultAsync(x => x.Id == knowledgeBaseId);
        if (knowledgeBase is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found knowledge base with id: {knowledgeBaseId}"));
        knowledgeBase.NumberOfComments = knowledgeBase.NumberOfVotes.GetValueOrDefault(0) - 1;
        context.KnowledgeBases.Update(knowledgeBase);

        var result = await context.SaveChangesAsync();
        if (result <= 0) return BadRequest(new ApiBadRequestResponse("Delete comment failed"));
        var commentVm = new CommentVm
        {
            Id = comment.Id,
            Content = comment.Content,
            CreateDate = comment.CreateDate,
            KnowledgeBaseId = comment.KnowledgeBaseId,
            LastModifiedDate = comment.LastModifiedDate,
            OwnerUserId = comment.OwnerUserId
        };
        return Ok(commentVm);
    }

    #endregion Comments

}
