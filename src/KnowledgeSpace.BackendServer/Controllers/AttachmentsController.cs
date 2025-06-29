using System.Net.Http.Headers;
using KnowledgeSpace.BackendServer.Data.Entities;
using KnowledgeSpace.BackendServer.Helpers;
using KnowledgeSpace.ViewModels.Contents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeSpace.BackendServer.Controllers;

public partial class KnowledgeBasesController
{
    #region Attachments

    [HttpGet("{knowledgeBaseId:int}/attachments")]
    public async Task<IActionResult> GetAttachment(int knowledgeBaseId)
    {
        var query = await context.Attachments
            .Where(x => x.KnowledgeBaseId == knowledgeBaseId)
            .Select(c => new AttachmentVm
            {
                Id = c.Id,
                LastModifiedDate = c.LastModifiedDate,
                CreateDate = c.CreateDate,
                FileName = c.FileName,
                FilePath = c.FilePath,
                FileSize = c.FileSize,
                FileType = c.FileType,
                KnowledgeBaseId = c.KnowledgeBaseId
            }).ToListAsync();

        return Ok(query);
    }

    [HttpDelete("{knowledgeBaseId:int}/attachments/{attachmentId:int}")]
    public async Task<IActionResult> DeleteAttachment(int attachmentId, int knowledgeBaseId)
    {
        var attachment = await context.Attachments.SingleOrDefaultAsync(x => x.Id == attachmentId);
        if (attachment is null)
            return BadRequest(new ApiBadRequestResponse($"Cannot found attachment with id {attachmentId}"));

        context.Attachments.Remove(attachment);

        var result = await context.SaveChangesAsync();
        if (result > 0)
        {
            return Ok();
        }
        return BadRequest(new ApiBadRequestResponse("Delete attachment failed"));
    }
        
    private async Task<Attachment?> SaveFile(int knowledgeBaseId, IFormFile file)
    {
        var name = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName;
        if (name is null) return null;
        var originalFileName = name.Trim('"');
        var fileName = $"{originalFileName[..originalFileName.LastIndexOf('.')]}{Path.GetExtension(originalFileName)}";
        await storageService.SaveFileAsync(file.OpenReadStream(), fileName);
        var attachmentEntity = new Attachment
        {
            FileName = fileName,
            FilePath = storageService.GetFileUrl(fileName),
            FileSize = file.Length,
            FileType = Path.GetExtension(fileName),
            KnowledgeBaseId = knowledgeBaseId,
        };
        return attachmentEntity;
    }

    #endregion Attachments
}
