# Fashion → Railway (PostgreSQL + Backend)

## Proje özeti

| Katman | Teknoloji | Konum |
|--------|-----------|--------|
| Frontend | React + Vite | `fashion/` |
| Backend | .NET 8 Minimal API | `fashionBackend/Fashion.Api/` |
| Veritabanı | **PostgreSQL 16** | Railway PostgreSQL eklentisi |

Backend açılışta EF migration uygular ve seed verisini yükler. Railway `PORT` ve `DATABASE_URL` ortam değişkenlerini otomatik sağlar.

---

## 1) Railway projesi

1. [railway.app](https://railway.app) → **New Project**
2. GitHub reposunu bağla (`fashion`)

## 2) PostgreSQL ekle

1. Projede **+ New** → **Database** → **PostgreSQL**
2. PostgreSQL servisinde **Variables** sekmesinde `DATABASE_URL` oluşur

## 3) Backend servisi

1. **+ New** → **GitHub Repo** (aynı repo) veya mevcut repodan **New Service**
2. Ayarlar:

| Alan | Değer |
|------|--------|
| **Root Directory** | `fashionBackend/Fashion.Api` |
| **Builder** | Dockerfile |
| **Dockerfile Path** | `Dockerfile` |

Alternatif (repo kökünden):

| Alan | Değer |
|------|--------|
| **Root Directory** | *(boş)* |
| **Dockerfile Path** | `Dockerfile` |

Kök `Dockerfile` zaten `fashionBackend/Fashion.Api` yolunu kullanıyor.

## 4) Ortam değişkenleri (Backend servisi)

Railway PostgreSQL'i backend'e bağla:

1. Backend servisinde **Variables** → **Add Reference** → PostgreSQL servisinden `DATABASE_URL` seç
2. İsteğe bağlı diğer değişkenler:

```env
ASPNETCORE_ENVIRONMENT=Production
Fashn__ApiKey=<fashn-api-key>
PayTr__MerchantId=
PayTr__MerchantKey=
PayTr__MerchantSalt=
PayTr__FrontendBaseUrl=https://design.nulatechnology.com
Auth__Google__ClientId=
Auth__Apple__ServicesId=
```

`DATABASE_URL` ve `PORT` Railway tarafından set edilir; `Program.cs` ikisini de okur.

## 5) CORS

Frontend domain'ini `appsettings.Production.json` içindeki `Cors:AllowedOrigins` listesine ekle veya Railway'de:

```env
Cors__AllowedOrigins__0=https://senin-frontend-domainin.com
```

## 6) Deploy sonrası kontrol

```bash
curl https://<backend-url>.up.railway.app/api/health
# {"status":"ok","service":"fashion-backend"}
```

## 7) Lokal geliştirme (PostgreSQL)

```bash
cd fashionBackend
docker compose up -d
cd Fashion.Api
dotnet run
```

- Postgres: `localhost:5433` — kullanıcı `fashion`, şifre `fashion123`, DB `fashiondb`
- API: `http://localhost:5207`
- Frontend proxy: `fashion/vite.config.ts` → `/api` → `localhost:5207`

## 8) Frontend (ayrı deploy)

Frontend Railway Static, Vercel veya Netlify'da deploy edilirken:

```env
VITE_API_BASE_URL=https://<backend-url>.up.railway.app
```

Boş bırakılırsa sadece lokal Vite proxy çalışır.

---

## Notlar

- Eski **MySQL/cPanel** yapılandırması kaldırıldı; tüm migration'lar PostgreSQL (Npgsql) için.
- `ExternalAuthSchema` ve `PayTrPaymentEndpoints` içindeki ham MySQL SQL artık kullanılmıyor; şema EF migration ile yönetiliyor.
- Production'da `Database:SkipMigrations` **false** olmalı (varsayılan).
