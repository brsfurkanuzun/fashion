# Fashion Backend Local Setup

## 1) PostgreSQL baslat

```bash
docker compose up -d
```

PostgreSQL host portu: `5433`

## 2) API calistir

```bash
cd Fashion.Api
dotnet run
```

## 3) Test endpointleri

- `GET http://localhost:5207/api/health`
- `GET http://localhost:5207/api/users`
- `GET http://localhost:5207/api/jobs`

Ornek job olusturma:

```bash
curl -X POST http://localhost:5207/api/jobs \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"<GET /api/users ile gelen id>\",\"toolKey\":\"pro-model\",\"prompt\":\"studio lighting\",\"creditCost\":10}"
```

> Not: Uygulama ilk acilista migration ve seed otomatik uygular.
