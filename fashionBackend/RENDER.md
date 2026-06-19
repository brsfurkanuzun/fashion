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

**Remote MySQL**’e `%` veya Render IP’si ekle. Free tier’da IP sabit olmayabilir; bağlantı koparsa ücretli plan veya **Outbound IP** dokümantasyonuna bak.

### Log’da `nulatechnology_nuladesign` + doğru IP/domain ama `Unable to connect to any of the specified MySQL hosts`

Bu genelde **MySQL’in dışarıdan dinlenmemesi** veya **firewall’da 3306’nın kapalı** olmasıdır. cPanel’deki **Shared IP**, web için olur; **Render → bu IP:3306** çoğu paylaşımlı pakette **erişilemez**.

**Kontrol:** Kendi bilgisayarından (Uzak MySQL’de `%` varken) `mysql` veya `Test-NetConnection HEDEF -Port 3306` ile dene. Bağlanmıyorsa hosting **3306’yı dışarı açmıyor** demektir — **destek**e sor: *“Harici sunucudan MySQL’e 3306 ile bağlanabilir miyim?”*

**Seçenekler:** (1) Hosting açsın / gerçek dış MySQL hostname versin, (2) **PlanetScale / Railway / Aiven** vb. bulut MySQL + connection string’i Render’a yaz, (3) API’yi **aynı hostingde** çalıştırıp DB’ye `localhost` ile git.

Geçici: `Database__ContinueOnInitFailure=true` → process düşmez, `/api/health` çalışır; veri endpoint’leri DB olmadan hata verir.

## PayTR (iFrame)

1. [PayTR Mağaza Paneli](https://www.paytr.com/) → **Bildirim URL**: tam adres  
   `https://SENIN-API-DOMAININ/api/payments/paytr/notify`  
   (Bu endpoint **form POST** kabul eder; yanıt gövdesi yalnızca `OK` olmalı — kodda öyle.)

2. Render / ortam değişkenleri (örnek):

```text
PayTr__MerchantId=...
PayTr__MerchantKey=...
PayTr__MerchantSalt=...
PayTr__FrontendBaseUrl=https://design.nulatechnology.com
PayTr__TestMode=0
PayTr__DebugOn=0
```

Canlı test öncesi: `MerchantId` boşsa API `503` döner (bilerek).

3. MySQL ilk açılışta `PaymentOrders` tablosu yoksa uygulama **CREATE TABLE IF NOT EXISTS** ile oluşturur (yalnızca MySQL sağlayıcısı).

## Google / Apple (OAuth)

Frontend `GET /api/auth/client-config` ile public client id’leri alır. Render’da:

```text
Auth__Google__ClientId=....apps.googleusercontent.com
Auth__Apple__ServicesId=com.example.web   # Services ID (bundle değil)
```

- **Google Cloud Console**: OAuth 2.0 Client (Web) → **Authorized JavaScript origins** = Vite dev (`http://localhost:5173`) + prod SPA origin.
- **Apple Developer**: Sign in with Apple → Services ID → **Return URLs** ve **Domains** = SPA’nın `window.location.origin` (örn. `https://design.nulatechnology.com`).

Boş bırakılırsa ilgili buton gösterilmez.

## 6) Deploy sonrası

Render URL örn. `https://fashion-api-xxxx.onrender.com` → frontend’de API tabanını buna yönlendir (`VITE_API_URL` vb.).

**Health:** `GET /api/health`

## Not

İlk istekten sonra **free dyno uykuya** geçebilir; ilk açılış 30–60 sn sürebilir.
