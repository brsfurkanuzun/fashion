-- NulaDesign / Fashion — PostgreSQL veritabanı oluşturma
-- cPanel'de DB'yi panelden oluşturduysan bu dosyayı atlayabilirsin.

-- Superuser gerektirir (genelde sadece sunucu yöneticisi çalıştırır)
CREATE DATABASE nuladesign
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE template0;

-- Uygulama kullanıcısı (şifreyi kendin belirle)
-- CREATE USER nuladesign_user WITH PASSWORD 'GÜÇLÜ_ŞİFRE';
-- GRANT ALL PRIVILEGES ON DATABASE nuladesign TO nuladesign_user;
