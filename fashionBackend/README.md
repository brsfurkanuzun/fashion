# Fashion Backend

## Railway (production)

PostgreSQL + API deploy adımları: **[RAILWAY.md](./RAILWAY.md)**

## Lokal geliştirme (PostgreSQL + Docker)

```bash
cd fashionBackend
docker compose up -d
```

| Servis    | Adres |
|-----------|--------|
| PostgreSQL | `localhost:5433` (kullanıcı `fashion`, şifre `fashion123`, veritabanı `fashiondb`) |
| pgAdmin 4  | Tarayıcı: **http://localhost:5050** — giriş: `admin@example.com` / `admin` |

### pgAdmin’de PostgreSQL sunucusu ekleme

1. Sol panelde **Servers** üzerine sağ tık → **Register** → **Server…**
2. **General** sekmesi: **Name** alanına istediğin ismi yaz (ör. `Fashion Local`).
3. **Connection** sekmesi (Docker’daki pgAdmin ile, yani tarayıcıdan `localhost:5050`):
   - **Host name/address:** `postgres`
   - **Port:** `5432`
   - **Maintenance database:** `fashiondb`
   - **Username:** `fashion`
   - **Password:** `fashion123` — isteğe bağlı **Save password**
4. **Save** ile kaydet.

pgAdmin’i Windows’a kurduysan aynı adımlarda **Host:** `127.0.0.1`, **Port:** `5433` kullan (Postgres dışarı bu portta yayınlanıyor).

> “Servers” görünmüyorsa: sol üst **Object Explorer** açık olsun; daraltılmışsa `>` ile genişlet.

API’nin gerçek Postgres kullanması için `Fashion.Api/appsettings.Development.json` içinde `"UseInMemory": false` yap. Postgres ayağa kalktıktan sonra tablolar için **bir kez**:

```bash
cd fashionBackend
dotnet tool restore
cd Fashion.Api
dotnet ef database update
```

veya sadece `dotnet run` (API açılışta migration uygular).

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
