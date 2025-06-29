using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using KnowledgeSpace.BackendServer.Data.Interfaces;

namespace KnowledgeSpace.BackendServer.Data.Entities;

[Table("ActivityLogs")]
public class ActivityLog : IDateTracking
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    [Required]
    public string Action { get; set; } = default!;

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    [Required]
    public string EntityName { get; set; } = default!;

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    [Required]
    public string EntityId { get; set; } = default!;

    public DateTime CreateDate { get; set; }

    public DateTime? LastModifiedDate { get; set; }

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string UserId { get; set; } = default!;

    [MaxLength(500)]
    public string Content { get; set; } = default!;
}
