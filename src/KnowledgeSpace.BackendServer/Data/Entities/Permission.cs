using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KnowledgeSpace.BackendServer.Data.Entities;

[Table("Permissions")]
public class Permission(string functionId, string roleId, string commandId)
{
    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string FunctionId { get; set; } = functionId;

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string RoleId { get; set; } = roleId;

    [MaxLength(50)]
    [Column(TypeName = "varchar(50)")]
    public string CommandId { get; set; } = commandId;
}