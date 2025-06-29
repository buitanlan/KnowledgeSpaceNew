using Microsoft.OpenApi.Models;

namespace KnowledgeSpace.BackendServer.Extensions;

public static class SwaggerServiceExtensions
{
    public static void AddSwaggerDocument(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "KnowledgeBase",
                Version = "v1",
                Contact = new OpenApiContact
                {
                    Name = "Bùi Tấn Lân",
                    Email = "tanlanhcmus@gmail.com",
                    Url = new Uri("https://dev.azure.com/tanlanhcmus/KnowledgeSpace")
                },
                License = new OpenApiLicense
                {
                    Name = "MIT License",
                    //Url = new Uri("https://example.com/license"),
                }
            });
            var securitySchema = new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            };
            c.AddSecurityDefinition("Bearer", securitySchema);
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    new string[] { }
                }
            });
        });
    }
    public static void UseSwaggerDocument(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "KnowledgeBase API v1");
        });
    }

}
