# Fashion.Api → Render

## 1) GitHub

Repoyu GitHub’a it; `fashionBackend/Fashion.Api` klasöründe `Dockerfile` var.

## 2) Render hesabı

[render.com](https://render.com) → **New +** → **Web Service** → GitHub repo’yu bağla.

## 3) Ayarlar

Repoda **kökte `Dockerfile`** var (`fashion/Dockerfile`). Render’da şöyle kullan:

| Alan | Değer |
|------|--------|
| **Language** | **Docker** |
| **Root Directory** | *(boş bırak — repo kökü)* |
| **Dockerfile Path** | *(boş)* veya `Dockerfile` |
| **Instance type** | Free veya ücretli |

Alternatif: Root Directory = `fashionBackend/Fashion.Api` + Dockerfile Path boş → o zaman sadece alt klasördeki `Fashion.Api/Dockerfile` kullanılır (ikinci Dockerfile).

Kök `Dockerfile` yoksa clone’da “open Dockerfile: no such file” hatası alırsın; **git push** ile kökteki dosyayı GitHub’a gönder.

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
ConnectionStrings__DefaultConnection=Server=CPANEL_MYSQL_HOSTNAME;Port=3306;Database=DB;User=USER;Password=PAROLA;
Database__SkipMigrations=true
```

`Server=` **asla** `localhost` olmamalı (Render konteyneri cPanel’e gidemez). cPanel’deki **uzak MySQL sunucu adı** (ör. `mysql123.hosting.com`).

İsteğe bağlı (cPanel MariaDB sürümün farklıysa):

```text
Database__ServerVersion=10.11.6-mariadb
```

Geçici olarak DB yokken servisin ayağa kalkması (sadece `/api/health`; API verisi yok):

```text
Database__ContinueOnInitFailure=true
```

Kalıcı çözüm: **Remote MySQL** + doğru `ConnectionStrings__DefaultConnection`.

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
