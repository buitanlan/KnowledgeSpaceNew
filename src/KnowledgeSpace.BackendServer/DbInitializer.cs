using KnowledgeSpace.BackendServer.Data;
using KnowledgeSpace.BackendServer.Data.Entities;
using Microsoft.AspNetCore.Identity;
namespace KnowledgeSpace.BackendServer;

public class DbInitializer(ApplicationDbContext context,
    UserManager<User> userManager,
    RoleManager<IdentityRole> roleManager)
{
    private const string AdminRoleName = "Admin";
    private const string UserRoleName = "Member";

    public async Task Seed()
    {
        #region Quyền

        if (!roleManager.Roles.Any())
        {
            await roleManager.CreateAsync(new IdentityRole
            {
                Id = AdminRoleName,
                Name = AdminRoleName,
                NormalizedName = AdminRoleName.ToUpper(),
            });
            await roleManager.CreateAsync(new IdentityRole
            {
                Id = UserRoleName,
                Name = UserRoleName,
                NormalizedName = UserRoleName.ToUpper(),
            });
        }

        #endregion Quyền

        #region Người dùng

        if (!userManager.Users.Any())
        {
            // Create default admin user
            var adminResult = await userManager.CreateAsync(new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "admin",
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@knowledgespace.com",
                LockoutEnabled = false
            }, "Admin@123");

            if (adminResult.Succeeded)
            {
                var adminUser = await userManager.FindByNameAsync("admin");
                await userManager.AddToRoleAsync(adminUser, AdminRoleName);
            }

            // Create default regular user
            var userResult = await userManager.CreateAsync(new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = "user",
                FirstName = "Regular",
                LastName = "User",
                Email = "user@knowledgespace.com",
                LockoutEnabled = false
            }, "User@123");

            if (userResult.Succeeded)
            {
                var regularUser = await userManager.FindByNameAsync("user");
                await userManager.AddToRoleAsync(regularUser, UserRoleName);
            }
        }

        #endregion Người dùng

        #region Chức năng
        var listFunction = new List<Function>
            {
                new() {Id = "Dashboard", Name = "Thống kê", ParentId = null, SortOrder = 1,Url = "/dashboard",Icon="fa-tachometer-alt"  },
                new() {Id = "Content",Name = "Nội dung",ParentId = null,Url ="/contents",Icon="fa-table" },
                new() {Id = "ContentCategory",Name = "Danh mục",ParentId ="Content",Url = "/contents/categories",Icon="fa-list" },
                new() {Id = "ContentKnowledgeBase",Name = "Bài viết",ParentId = "Content",SortOrder = 2,Url = "/contents/knowledge-bases",Icon="fa-edit" },
                new() {Id = "ContentComment",Name = "Trang",ParentId = "Content",SortOrder = 3,Url = "/contents/comments",Icon="fa-edit" },
                new() {Id = "ContentReport",Name = "Báo xấu",ParentId = "Content",SortOrder = 3,Url = "/contents/reports",Icon="fa-edit" },

                new() {Id = "Statistic",Name = "Thống kê", ParentId = null, Url = "/statistics",Icon="fa-chart-bar" },
                new() {Id = "StatisticMonthlyNewMember",Name = "Đăng ký từng tháng",ParentId = "Statistic",SortOrder = 1,Url = "/statistics/monthly-new-members",Icon = "fa-wrench"},
                new() {Id = "StatisticMonthlyNewKnowledgeBase",Name = "Bài đăng hàng tháng",ParentId = "Statistic",SortOrder = 2,Url = "/statistics/monthly-new-knowledge-bases",Icon = "fa-wrench"},
                new() {Id = "StatisticMonthlyComment",Name = "Comment theo tháng",ParentId = "Statistic",SortOrder = 3,Url = "/statistics/monthly-new-comments",Icon = "fa-wrench" },

                new() {Id = "System", Name = "Hệ thống", ParentId = null, Url = "/systems",Icon="fa-th-list" },
                new() {Id = "SystemUser", Name = "Người dùng",ParentId = "System",Url = "/systems/users",Icon="fa-desktop"},
                new() {Id = "SystemRole", Name = "Nhóm quyền",ParentId = "System",Url = "/systems/roles",Icon="fa-desktop"},
                new() {Id = "SystemFunction", Name = "Chức năng",ParentId = "System",Url = "/systems/functions",Icon="fa-desktop"},
                new() {Id = "SystemPermission", Name = "Quyền hạn",ParentId = "System",Url = "/systems/permissions",Icon="fa-desktop"},
            };

        if (!context.Functions.Any())
        {
            context.Functions.AddRange(listFunction);
        }

        if (!context.Commands.Any())
        {
            context.Commands.AddRange(new List<Command>
            {
                new() {Id = "View", Name = "Xem"},
                new() {Id = "Create", Name = "Thêm"},
                new() {Id = "Update", Name = "Sửa"},
                new() {Id = "Delete", Name = "Xoá"},
                new() {Id = "Approve", Name = "Duyệt"},
            });
        }

        #endregion Chức năng

        var functions = context.Functions;

        if (!context.CommandInFunctions.Any())
        {
            foreach (var function in listFunction)
            {
                var createAction = new CommandInFunction
                {
                    CommandId = "Create",
                    FunctionId = function.Id
                };
                context.CommandInFunctions.Add(createAction);

                var updateAction = new CommandInFunction
                {
                    CommandId = "Update",
                    FunctionId = function.Id
                };
                context.CommandInFunctions.Add(updateAction);
                var deleteAction = new CommandInFunction
                {
                    CommandId = "Delete",
                    FunctionId = function.Id
                };
                context.CommandInFunctions.Add(deleteAction);

                var viewAction = new CommandInFunction
                {
                    CommandId = "View",
                    FunctionId = function.Id
                };
                context.CommandInFunctions.Add(viewAction);
            }
        }

        if (!context.Permissions.Any())
        {
            var adminRole = await roleManager.FindByNameAsync(AdminRoleName);
            foreach (var function in listFunction)
            {
                context.Permissions.Add(new(function.Id, adminRole.Id, "Create"));
                context.Permissions.Add(new(function.Id, adminRole.Id, "Update"));
                context.Permissions.Add(new(function.Id, adminRole.Id, "Delete"));
                context.Permissions.Add(new(function.Id, adminRole.Id, "View"));
            }
        }

        await context.SaveChangesAsync();
    }
}