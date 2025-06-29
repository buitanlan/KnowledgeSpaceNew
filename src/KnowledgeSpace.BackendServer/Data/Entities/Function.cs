using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities;

[Table("Functions")]
public class Function
{
    [Key]
    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string Id { get; set; }

    [MaxLength(200)]
    [Required]
    public string Name { get; set; } = default!;

    [MaxLength(200)]
    [Required]
    public string Url { get; set; } = default!;

    [Required]
    public int SortOrder { get; set; }

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string? ParentId { get; set; }
    
    
    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string Icon { get; set; } = default!;
}