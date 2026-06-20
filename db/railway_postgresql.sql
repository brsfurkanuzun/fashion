-- NulaDesign — Railway PostgreSQL kurulum
-- Railway Query sekmesine veya psql ile yapıştırın (DATABASE zaten oluşturulmuş olmalı).
-- \c ve CREATE DATABASE kullanmayın.

BEGIN;

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    character varying(150) NOT NULL,
    "ProductVersion" character varying(32)  NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

CREATE TABLE IF NOT EXISTS "Users" (
    "Id"           uuid                     NOT NULL,
    "Email"        character varying(180)   NOT NULL,
    "PasswordHash" character varying(500)   NOT NULL DEFAULT '',
    "DisplayName"  character varying(120)   NOT NULL,
    "Role"         character varying(40)    NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "GoogleSub"    character varying(128),
    "AppleSub"     character varying(128),
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "CreditWallets" (
    "Id"      uuid    NOT NULL,
    "UserId"  uuid    NOT NULL,
    "Balance" integer NOT NULL,
    CONSTRAINT "PK_CreditWallets" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditWallets_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CreditTransactions" (
    "Id"           uuid                     NOT NULL,
    "UserId"       uuid                     NOT NULL,
    "Amount"       integer                  NOT NULL,
    "Type"         integer                  NOT NULL,
    "Description"  character varying(300)   NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_CreditTransactions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditTransactions_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GenerationJobs" (
    "Id"             uuid                     NOT NULL,
    "UserId"         uuid                     NOT NULL,
    "ToolKey"        character varying(60)    NOT NULL,
    "Prompt"         character varying(2000)  NOT NULL,
    "CreditCost"     integer                  NOT NULL,
    "Status"         integer                  NOT NULL,
    "FashnJobId"     character varying(120),
    "ResultUrls"     character varying(4000),
    "ErrorMessage"   character varying(1000),
    "CompletedAtUtc" timestamp with time zone,
    "CreatedAtUtc"   timestamp with time zone NOT NULL,
    CONSTRAINT "PK_GenerationJobs" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_GenerationJobs_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GalleryItems" (
    "Id"           uuid                     NOT NULL,
    "UserId"       uuid                     NOT NULL,
    "SourceJobId"  uuid,
    "ToolKey"      character varying(60)    NOT NULL,
    "PreviewUrl"   character varying(1000)  NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_GalleryItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_GalleryItems_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ToolDefinitions" (
    "Id"           uuid                     NOT NULL,
    "ToolKey"      character varying(80)    NOT NULL,
    "Workspace"    character varying(40)    NOT NULL,
    "Label"        character varying(120)   NOT NULL,
    "Quality"      character varying(4)     NOT NULL,
    "CreditCost"   integer                  NOT NULL,
    "IsNew"        boolean                  NOT NULL DEFAULT FALSE,
    "IsActive"     boolean                  NOT NULL DEFAULT TRUE,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ToolDefinitions" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "ChangelogEntries" (
    "Id"             uuid                     NOT NULL,
    "Title"          character varying(180)   NOT NULL,
    "Type"           character varying(40)    NOT NULL,
    "Summary"        character varying(2000)  NOT NULL,
    "PublishedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ChangelogEntries" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "PaymentOrders" (
    "MerchantOid"        character varying(64)  NOT NULL,
    "UserId"             uuid                   NOT NULL,
    "PackageKey"         character varying(40)  NOT NULL,
    "PaymentAmountMinor" integer                NOT NULL,
    "CreditsToGrant"     integer                NOT NULL,
    "Status"             character varying(20)  NOT NULL,
    "CreatedAtUtc"       timestamp with time zone NOT NULL,
    "CompletedAtUtc"     timestamp with time zone,
    CONSTRAINT "PK_PaymentOrders" PRIMARY KEY ("MerchantOid"),
    CONSTRAINT "FK_PaymentOrders_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_GoogleSub" ON "Users" ("GoogleSub") WHERE "GoogleSub" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_AppleSub" ON "Users" ("AppleSub") WHERE "AppleSub" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "IX_CreditWallets_UserId" ON "CreditWallets" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_CreditTransactions_UserId" ON "CreditTransactions" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_UserId" ON "GenerationJobs" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_Status" ON "GenerationJobs" ("Status");
CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_FashnJobId" ON "GenerationJobs" ("FashnJobId");
CREATE INDEX IF NOT EXISTS "IX_GalleryItems_UserId" ON "GalleryItems" ("UserId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_ToolDefinitions_ToolKey_Quality" ON "ToolDefinitions" ("ToolKey", "Quality");
CREATE INDEX IF NOT EXISTS "IX_PaymentOrders_UserId" ON "PaymentOrders" ("UserId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
    ('20260528054527_InitialCreate', '8.0.11'),
    ('20260528063018_AddPasswordHash', '8.0.11'),
    ('20260528065114_AddCatalogAndProfileEndpoints', '8.0.11'),
    ('20260607203620_AddFashnJobFields', '8.0.11'),
    ('20260608113503_AddExpenses', '8.0.11'),
    ('20260608115117_RemoveExpenseNoteAndUpdatedAt', '8.0.11'),
    ('20260608115832_DropExpenseTable', '8.0.11'),
    ('20260608122636_AddToolMultiplier', '8.0.11'),
    ('20260608123147_AddToolPricingVariants', '8.0.11'),
    ('20260608155608_RemoveMultiplierAddQuality', '8.0.11')
ON CONFLICT ("MigrationId") DO NOTHING;

-- Admin: admin@fashion.local / admin
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "DisplayName", "Role", "CreatedAtUtc")
VALUES (
    'a0000000-0000-4000-8000-000000000001',
    'admin@fashion.local',
    '100000.So8sEZ5VdwO6bR+IRMKQWg==.5esf5PVGXuuMrLv/RFDqmNxRlJYjOQZc1q5tyuC5PH8=',
    'Admin',
    'admin',
    NOW() AT TIME ZONE 'UTC'
)
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "CreditWallets" ("Id", "UserId", "Balance")
SELECT 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 500
WHERE NOT EXISTS (SELECT 1 FROM "CreditWallets" WHERE "UserId" = 'a0000000-0000-4000-8000-000000000001');

INSERT INTO "CreditTransactions" ("Id", "UserId", "Amount", "Type", "Description", "CreatedAtUtc")
SELECT 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 500, 1, 'Initial seed credits', NOW() AT TIME ZONE 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM "CreditTransactions" WHERE "Id" = 'c0000000-0000-4000-8000-000000000001');

INSERT INTO "ToolDefinitions" ("Id", "ToolKey", "Workspace", "Label", "Quality", "CreditCost", "IsNew", "IsActive", "CreatedAtUtc") VALUES
('d0000001-0000-4000-8000-000000000001','cekim-model','cekim','MODEL\TRY ON','1k',24,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000001-0000-4000-8000-000000000002','cekim-model','cekim','MODEL\TRY ON','2k',40,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000001-0000-4000-8000-000000000003','cekim-model','cekim','MODEL\TRY ON','4k',60,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000002-0000-4000-8000-000000000001','cekim-editorial','cekim','EDITORIAL','1k',33,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000002-0000-4000-8000-000000000002','cekim-editorial','cekim','EDITORIAL','2k',55,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000002-0000-4000-8000-000000000003','cekim-editorial','cekim','EDITORIAL','4k',83,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000003-0000-4000-8000-000000000001','cekim-pose','cekim','POSE','1k',18,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000003-0000-4000-8000-000000000002','cekim-pose','cekim','POSE','2k',30,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000003-0000-4000-8000-000000000003','cekim-pose','cekim','POSE','4k',45,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000004-0000-4000-8000-000000000001','cekim-video','cekim','VIDEO','1k',48,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000004-0000-4000-8000-000000000002','cekim-video','cekim','VIDEO','2k',80,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000004-0000-4000-8000-000000000003','cekim-video','cekim','VIDEO','4k',120,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000005-0000-4000-8000-000000000001','pro-model','produksiyon','MODEL','1k',90,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000005-0000-4000-8000-000000000002','pro-model','produksiyon','MODEL','2k',150,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000005-0000-4000-8000-000000000003','pro-model','produksiyon','MODEL','4k',225,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000006-0000-4000-8000-000000000001','pro-tryon','produksiyon','TRY ON','1k',6,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000006-0000-4000-8000-000000000002','pro-tryon','produksiyon','TRY ON','2k',9,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000006-0000-4000-8000-000000000003','pro-tryon','produksiyon','TRY ON','4k',12,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000007-0000-4000-8000-000000000001','pro-edit','produksiyon','EDIT','1k',57,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000007-0000-4000-8000-000000000002','pro-edit','produksiyon','EDIT','2k',95,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000007-0000-4000-8000-000000000003','pro-edit','produksiyon','EDIT','4k',143,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000008-0000-4000-8000-000000000001','pro-decoupe','produksiyon','DECOUPE','1k',6,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000008-0000-4000-8000-000000000002','pro-decoupe','produksiyon','DECOUPE','2k',9,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000008-0000-4000-8000-000000000003','pro-decoupe','produksiyon','DECOUPE','4k',12,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000009-0000-4000-8000-000000000001','pro-editorial','produksiyon','EDITORIAL','1k',66,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000009-0000-4000-8000-000000000002','pro-editorial','produksiyon','EDITORIAL','2k',110,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000009-0000-4000-8000-000000000003','pro-editorial','produksiyon','EDITORIAL','4k',165,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000010-0000-4000-8000-000000000001','pro-moodboard','produksiyon','MOODBOARD','1k',39,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000010-0000-4000-8000-000000000002','pro-moodboard','produksiyon','MOODBOARD','2k',65,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000010-0000-4000-8000-000000000003','pro-moodboard','produksiyon','MOODBOARD','4k',98,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000011-0000-4000-8000-000000000001','pro-swap','produksiyon','SWAP','1k',54,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000011-0000-4000-8000-000000000002','pro-swap','produksiyon','SWAP','2k',90,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000011-0000-4000-8000-000000000003','pro-swap','produksiyon','SWAP','4k',135,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000012-0000-4000-8000-000000000001','pro-pose','produksiyon','POSE','1k',42,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000012-0000-4000-8000-000000000002','pro-pose','produksiyon','POSE','2k',70,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000012-0000-4000-8000-000000000003','pro-pose','produksiyon','POSE','4k',105,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000013-0000-4000-8000-000000000001','pro-angle','produksiyon','ANGLE','1k',36,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000013-0000-4000-8000-000000000002','pro-angle','produksiyon','ANGLE','2k',60,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000013-0000-4000-8000-000000000003','pro-angle','produksiyon','ANGLE','4k',90,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000014-0000-4000-8000-000000000001','pro-video','produksiyon','VIDEO','1k',108,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000014-0000-4000-8000-000000000002','pro-video','produksiyon','VIDEO','2k',180,FALSE,TRUE,NOW() AT TIME ZONE 'UTC'),
('d0000014-0000-4000-8000-000000000003','pro-video','produksiyon','VIDEO','4k',270,FALSE,TRUE,NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("ToolKey", "Quality") DO NOTHING;

INSERT INTO "ChangelogEntries" ("Id", "Title", "Type", "Summary", "PublishedAtUtc") VALUES
('e0000001-0000-4000-8000-000000000001','Studio job queue eklendi','feature','Oluştur aksiyonu backend job kuyruğuna yazılıyor ve kredi düşümü yapılıyor.',NOW() AT TIME ZONE 'UTC'),
('e0000002-0000-4000-8000-000000000001','Gerçek auth kontrolü','security','Register/login akışı şifre hash doğrulaması ile backend''e taşındı.',NOW() AT TIME ZONE 'UTC'),
('e0000003-0000-4000-8000-000000000001','Tool kataloğu seed edildi','improvement','FAST ve PRO araçlarının kredi maliyetleri veritabanına eklendi.',NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("Id") DO NOTHING;

COMMIT;
