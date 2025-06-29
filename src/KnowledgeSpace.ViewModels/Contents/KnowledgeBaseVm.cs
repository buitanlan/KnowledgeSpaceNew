namespace KnowledgeSpace.ViewModels.Contents;

public class KnowledgeBaseVm
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string SeoAlias { get; set; } = string.Empty;

    public string Description { get; set; }= string.Empty;

    public string Environment { get; set; } = string.Empty;

    public string Problem { get; set; } = string.Empty;

    public string StepToReproduce { get; set; } = string.Empty;

    public string ErrorMessage { get; set; } = string.Empty;

    public string Workaround { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;

    public string OwnerUserId { get; set; } = string.Empty;

    public string[]? Labels { get; set; } = [];

    public DateTime CreateDate { get; set; }

    public DateTime? LastModifiedDate { get; set; }

    public int? NumberOfComments { get; set; }

    public int? NumberOfVotes { get; set; }

    public int? NumberOfReports { get; set; }

    public List<AttachmentVm> Attachments { set; get; } = [];

}
