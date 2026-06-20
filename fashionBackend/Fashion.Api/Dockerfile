# Railway: build context = repo kökü (Root Directory boş veya /)
# Local: docker build -f fashionBackend/Fashion.Api/Dockerfile .
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY fashionBackend/Fashion.Api/Fashion.Api.csproj fashionBackend/Fashion.Api/
RUN dotnet restore fashionBackend/Fashion.Api/Fashion.Api.csproj
COPY fashionBackend/Fashion.Api/ fashionBackend/Fashion.Api/
WORKDIR /src/fashionBackend/Fashion.Api
RUN dotnet publish Fashion.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
# Render injects PORT at runtime; Program.cs de UseUrls ile dinler
EXPOSE 8080
ENTRYPOINT ["dotnet", "Fashion.Api.dll"]
