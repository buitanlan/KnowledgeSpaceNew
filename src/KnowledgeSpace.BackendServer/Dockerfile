FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/KnowledgeSpace.BackendServer/KnowledgeSpace.BackendServer.csproj", "src/KnowledgeSpace.BackendServer/"]
COPY ["src/KnowledgeSpace.ViewModels/KnowledgeSpace.ViewModels.csproj", "src/KnowledgeSpace.ViewModels/"]
RUN dotnet restore "src/KnowledgeSpace.BackendServer/KnowledgeSpace.BackendServer.csproj"
COPY . .
WORKDIR "/src/src/KnowledgeSpace.BackendServer"
RUN dotnet build "KnowledgeSpace.BackendServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "KnowledgeSpace.BackendServer.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "KnowledgeSpace.BackendServer.dll"]
