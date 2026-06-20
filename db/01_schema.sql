-- NulaDesign / Fashion — tablo şeması (PostgreSQL)
-- Çalıştırmadan önce: \c nuladesign  veya  USE nuladesign (aracına göre)

BEGIN;

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    character varying(150) NOT NULL,
    "ProductVersion" character varying(32)  NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

CREATE TABLE IF NOT EXISTS "Users" (
    "Id"           uuid                        NOT NULL,
    "Email"        character varying(180)      NOT NULL,
    "PasswordHash" character varying(500)      NOT NULL DEFAULT '',
    "DisplayName"  character varying(120)      NOT NULL,
    "Role"         character varying(40)       NOT NULL,
    "CreatedAtUtc" timestamp with time zone    NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "CreditWallets" (
    "Id"      uuid NOT NULL,
    "UserId"  uuid NOT NULL,
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
    "Id"              uuid                     NOT NULL,
    "Title"           character varying(180)   NOT NULL,
    "Type"            character varying(40)    NOT NULL,
    "Summary"         character varying(2000)  NOT NULL,
    "PublishedAtUtc"  timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ChangelogEntries" PRIMARY KEY ("Id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email"
    ON "Users" ("Email");

CREATE UNIQUE INDEX IF NOT EXISTS "IX_CreditWallets_UserId"
    ON "CreditWallets" ("UserId");

CREATE INDEX IF NOT EXISTS "IX_CreditTransactions_UserId"
    ON "CreditTransactions" ("UserId");

CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_UserId"
    ON "GenerationJobs" ("UserId");

CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_Status"
    ON "GenerationJobs" ("Status");

CREATE INDEX IF NOT EXISTS "IX_GenerationJobs_FashnJobId"
    ON "GenerationJobs" ("FashnJobId");

CREATE INDEX IF NOT EXISTS "IX_GalleryItems_UserId"
    ON "GalleryItems" ("UserId");

CREATE UNIQUE INDEX IF NOT EXISTS "IX_ToolDefinitions_ToolKey_Quality"
    ON "ToolDefinitions" ("ToolKey", "Quality");

-- EF migration kayıtları (uygulama tekrar migrate etmeye çalışmasın)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
    ('20260528054527_InitialCreate', '9.0.8'),
    ('20260528063018_AddPasswordHash', '9.0.8'),
    ('20260528065114_AddCatalogAndProfileEndpoints', '9.0.8'),
    ('20260607203620_AddFashnJobFields', '9.0.8'),
    ('20260608113503_AddExpenses', '9.0.8'),
    ('20260608115117_RemoveExpenseNoteAndUpdatedAt', '9.0.8'),
    ('20260608115832_DropExpenseTable', '9.0.8'),
    ('20260608122636_AddToolMultiplier', '9.0.8'),
    ('20260608123147_AddToolPricingVariants', '9.0.8'),
    ('20260608155608_RemoveMultiplierAddQuality', '9.0.8'),
    ('20260619120000_AddExternalAuthAndPayments', '8.0.11')
ON CONFLICT ("MigrationId") DO NOTHING;

COMMIT;
