# Repo kökü (GitHub: …/fashion) — Render Root Directory BOŞ bırakılabilir.
# API: fashionBackend/Fashion.Api
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY fashionBackend/Fashion.Api/Fashion.Api.csproj fashionBackend/Fashion.Api/
RUN dotnet restore fashionBackend/Fashion.Api/Fashion.Api.csproj
COPY fashionBackend/Fashion.Api/ fashionBackend/Fashion.Api/
RUN dotnet publish fashionBackend/Fashion.Api/Fashion.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "Fashion.Api.dll"]
