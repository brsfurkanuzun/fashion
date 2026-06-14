# Render / Docker — .NET 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Fashion.Api.csproj .
RUN dotnet restore Fashion.Api.csproj
COPY . .
RUN dotnet publish Fashion.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
# Render injects PORT at runtime; Program.cs de UseUrls ile dinler
EXPOSE 8080
ENTRYPOINT ["dotnet", "Fashion.Api.dll"]
