using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using KnowledgeSpace.BackendServer.Data.Interfaces;

namespace KnowledgeSpace.BackendServer.Data.Entities;

[Table("Attachments")]
public class Attachment : IDateTracking
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] 
    [MaxLength(200)] 
    public string FileName { get; set; } = default!;

    [Required] 
    [MaxLength(200)] 
    public string FilePath { get; set; } = default!;

    [Required]
    [MaxLength(4)]
    [Column(TypeName = "varchar(4)")]
    public string FileType { get; set; } = default!;

    [Required]
    public long FileSize { get; set; } = default!;

    public int KnowledgeBaseId { get; set; }
        
    public DateTime CreateDate { get; set; }
    public DateTime? LastModifiedDate { get; set; }
}
