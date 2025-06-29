using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using KnowledgeSpace.BackendServer.Data.Interfaces;

namespace KnowledgeSpace.BackendServer.Data.Entities;

[Table("KnowledgeBases")]
public class KnowledgeBase : IDateTracking
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }

    [Required]
    [Range(1, Double.PositiveInfinity)]
    public int CategoryId { get; set; }

    [MaxLength(500)]
    [Required]
    public string Title { get; set; } = default!;

    [MaxLength(500)]
    [Required]
    [Column(TypeName = "varchar(500)")]
    public string SeoAlias { get; set; } = default!;

    [MaxLength(500)]
    public string Description { get; set; } = default!;

    [MaxLength(500)]
    public string Environment { get; set; } = default!;

    [MaxLength(500)]
    public string Problem { get; set; } = default!;

    public string StepToReproduce { get; set; } = default!;

    [MaxLength(500)]
    public string ErrorMessage { get; set; } = default!;

    [MaxLength(500)]
    public string Workaround { get; set; } = default!;

    public string Note { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string OwnerUserId { get; set; } = default!;

    public string Labels { get; set; } = default!;

    public DateTime CreateDate { get; set; }

    public DateTime? LastModifiedDate { get; set; }

    public int? NumberOfComments { get; set; }

    public int? NumberOfVotes { get; set; }

    public int? NumberOfReports { get; set; }
}