# Fashion.Api → Render

## 1) GitHub

Repoyu GitHub’a it; `fashionBackend/Fashion.Api` klasöründe `Dockerfile` var.

## 2) Render hesabı

[render.com](https://render.com) → **New +** → **Web Service** → GitHub repo’yu bağla.

## 3) Ayarlar

| Alan | Değer |
|------|--------|
| **Root Directory** | `fashionBackend/Fashion.Api` |
| **Runtime** | **Docker** |
| **Instance type** | Free veya ücretli |

Dockerfile kökte otomatik bulunur.

**Start Command** alanı çıkıyorsa (zorunluysa) şunu yaz:

```text
dotnet Fashion.Api.dll
```

`PORT` ortam değişkenini uygulama `Program.cs` içinde zaten dinliyor; ekstra `--urls` gerekmez.

Build Command boş bırakılabilir (Docker imajı Dockerfile ile üretilir).

---

### Docker kullanmıyorsan (Shell + .NET — önerilmez, Dockerfile daha kolay)

**Root Directory:** `fashionBackend/Fashion.Api`

**Build Command:**

```text
dotnet publish -c Release -o ./publish
```

**Start Command:**

```text
dotnet ./publish/Fashion.Api.dll --urls http://0.0.0.0:$PORT
```

**Runtime:** Native için Render’da resmi “.NET” seçeneği her zaman olmayabilir; mümkünse **Docker** seç.

## 4) Environment (Environment Group veya service env)

**Zorunlu örnekler** (MySQL cPanel’de, şema SQL ile):

```text
ConnectionStrings__DefaultConnection=Server=HOST;Port=3306;Database=DB;User=USER;Password=PAROLA;
Database__SkipMigrations=true
```

**CORS** (frontend adresin):

```text
Cors__AllowedOrigins__0=https://design.nulatechnology.com
```

İkinci origin için:

```text
Cors__AllowedOrigins__1=http://localhost:5173
```

**Fashn** (kullanıyorsan):

```text
Fashn__ApiKey=...
```

## 5) cPanel MySQL

**Remote MySQL**’e Render çıkış IP’si ekle. Free tier’da IP sabit olmayabilir; bağlantı koparsa ücretli plan veya **Outbound IP** dokümantasyonuna bak.

## 6) Deploy sonrası

Render URL örn. `https://fashion-api-xxxx.onrender.com` → frontend’de API tabanını buna yönlendir (`VITE_API_URL` vb.).

**Health:** `GET /api/health`

## Not

İlk istekten sonra **free dyno uykuya** geçebilir; ilk açılış 30–60 sn sürebilir.
