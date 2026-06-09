-- nuladesign — MySQL / MariaDB (cPanel phpMyAdmin)
-- phpMyAdmin'de nuladesign veritabanını seç, sonra çalıştır.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId`    VARCHAR(150) NOT NULL,
    `ProductVersion` VARCHAR(32)  NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Users` (
    `Id`           CHAR(36)     NOT NULL,
    `Email`        VARCHAR(180) NOT NULL,
    `PasswordHash` VARCHAR(500) NOT NULL DEFAULT '',
    `DisplayName`  VARCHAR(120) NOT NULL,
    `Role`         VARCHAR(40)  NOT NULL,
    `CreatedAtUtc` DATETIME(6)  NOT NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_Users_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CreditWallets` (
    `Id`      CHAR(36) NOT NULL,
    `UserId`  CHAR(36) NOT NULL,
    `Balance` INT      NOT NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_CreditWallets_UserId` (`UserId`),
    CONSTRAINT `FK_CreditWallets_Users_UserId`
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CreditTransactions` (
    `Id`           CHAR(36)     NOT NULL,
    `UserId`       CHAR(36)     NOT NULL,
    `Amount`       INT          NOT NULL,
    `Type`         INT          NOT NULL,
    `Description`  VARCHAR(300) NOT NULL,
    `CreatedAtUtc` DATETIME(6)  NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_CreditTransactions_UserId` (`UserId`),
    CONSTRAINT `FK_CreditTransactions_Users_UserId`
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `GenerationJobs` (
    `Id`             CHAR(36)      NOT NULL,
    `UserId`         CHAR(36)      NOT NULL,
    `ToolKey`        VARCHAR(60)   NOT NULL,
    `Prompt`         VARCHAR(2000) NOT NULL,
    `CreditCost`     INT           NOT NULL,
    `Status`         INT           NOT NULL,
    `FashnJobId`     VARCHAR(120)  NULL,
    `ResultUrls`     VARCHAR(4000) NULL,
    `ErrorMessage`   VARCHAR(1000) NULL,
    `CompletedAtUtc` DATETIME(6)   NULL,
    `CreatedAtUtc`   DATETIME(6)   NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_GenerationJobs_UserId` (`UserId`),
    KEY `IX_GenerationJobs_Status` (`Status`),
    KEY `IX_GenerationJobs_FashnJobId` (`FashnJobId`),
    CONSTRAINT `FK_GenerationJobs_Users_UserId`
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `GalleryItems` (
    `Id`           CHAR(36)      NOT NULL,
    `UserId`       CHAR(36)      NOT NULL,
    `SourceJobId`  CHAR(36)      NULL,
    `ToolKey`      VARCHAR(60)   NOT NULL,
    `PreviewUrl`   VARCHAR(1000) NOT NULL,
    `CreatedAtUtc` DATETIME(6)   NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_GalleryItems_UserId` (`UserId`),
    CONSTRAINT `FK_GalleryItems_Users_UserId`
        FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ToolDefinitions` (
    `Id`           CHAR(36)     NOT NULL,
    `ToolKey`      VARCHAR(80)  NOT NULL,
    `Workspace`    VARCHAR(40)  NOT NULL,
    `Label`        VARCHAR(120) NOT NULL,
    `Quality`      VARCHAR(4)   NOT NULL,
    `CreditCost`   INT          NOT NULL,
    `IsNew`        TINYINT(1)   NOT NULL DEFAULT 0,
    `IsActive`     TINYINT(1)   NOT NULL DEFAULT 1,
    `CreatedAtUtc` DATETIME(6)  NOT NULL,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `IX_ToolDefinitions_ToolKey_Quality` (`ToolKey`, `Quality`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ChangelogEntries` (
    `Id`             CHAR(36)      NOT NULL,
    `Title`          VARCHAR(180)  NOT NULL,
    `Type`           VARCHAR(40)   NOT NULL,
    `Summary`        VARCHAR(2000) NOT NULL,
    `PublishedAtUtc` DATETIME(6)   NOT NULL,
    PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20260528054527_InitialCreate', '9.0.8'),
('20260528063018_AddPasswordHash', '9.0.8'),
('20260528065114_AddCatalogAndProfileEndpoints', '9.0.8'),
('20260607203620_AddFashnJobFields', '9.0.8'),
('20260608113503_AddExpenses', '9.0.8'),
('20260608115117_RemoveExpenseNoteAndUpdatedAt', '9.0.8'),
('20260608115832_DropExpenseTable', '9.0.8'),
('20260608122636_AddToolMultiplier', '9.0.8'),
('20260608123147_AddToolPricingVariants', '9.0.8'),
('20260608155608_RemoveMultiplierAddQuality', '9.0.8');

INSERT IGNORE INTO `Users` (`Id`, `Email`, `PasswordHash`, `DisplayName`, `Role`, `CreatedAtUtc`) VALUES
('a0000000-0000-4000-8000-000000000001', 'admin@fashion.local', '100000.So8sEZ5VdwO6bR+IRMKQWg==.5esf5PVGXuuMrLv/RFDqmNxRlJYjOQZc1q5tyuC5PH8=', 'Admin', 'admin', UTC_TIMESTAMP(6));

INSERT IGNORE INTO `CreditWallets` (`Id`, `UserId`, `Balance`) VALUES
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 500);

INSERT IGNORE INTO `CreditTransactions` (`Id`, `UserId`, `Amount`, `Type`, `Description`, `CreatedAtUtc`) VALUES
('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 500, 1, 'Initial seed credits', UTC_TIMESTAMP(6));

INSERT IGNORE INTO `ToolDefinitions` (`Id`, `ToolKey`, `Workspace`, `Label`, `Quality`, `CreditCost`, `IsNew`, `IsActive`, `CreatedAtUtc`) VALUES
('d0000001-0000-4000-8000-000000000001','cekim-model','cekim','MODEL\\TRY ON','1k',24,0,1,UTC_TIMESTAMP(6)),
('d0000001-0000-4000-8000-000000000002','cekim-model','cekim','MODEL\\TRY ON','2k',40,0,1,UTC_TIMESTAMP(6)),
('d0000001-0000-4000-8000-000000000003','cekim-model','cekim','MODEL\\TRY ON','4k',60,0,1,UTC_TIMESTAMP(6)),
('d0000002-0000-4000-8000-000000000001','cekim-editorial','cekim','EDITORIAL','1k',33,0,1,UTC_TIMESTAMP(6)),
('d0000002-0000-4000-8000-000000000002','cekim-editorial','cekim','EDITORIAL','2k',55,0,1,UTC_TIMESTAMP(6)),
('d0000002-0000-4000-8000-000000000003','cekim-editorial','cekim','EDITORIAL','4k',83,0,1,UTC_TIMESTAMP(6)),
('d0000003-0000-4000-8000-000000000001','cekim-pose','cekim','POSE','1k',18,0,1,UTC_TIMESTAMP(6)),
('d0000003-0000-4000-8000-000000000002','cekim-pose','cekim','POSE','2k',30,0,1,UTC_TIMESTAMP(6)),
('d0000003-0000-4000-8000-000000000003','cekim-pose','cekim','POSE','4k',45,0,1,UTC_TIMESTAMP(6)),
('d0000004-0000-4000-8000-000000000001','cekim-video','cekim','VIDEO','1k',48,0,1,UTC_TIMESTAMP(6)),
('d0000004-0000-4000-8000-000000000002','cekim-video','cekim','VIDEO','2k',80,0,1,UTC_TIMESTAMP(6)),
('d0000004-0000-4000-8000-000000000003','cekim-video','cekim','VIDEO','4k',120,0,1,UTC_TIMESTAMP(6)),
('d0000005-0000-4000-8000-000000000001','pro-model','produksiyon','MODEL','1k',90,0,1,UTC_TIMESTAMP(6)),
('d0000005-0000-4000-8000-000000000002','pro-model','produksiyon','MODEL','2k',150,0,1,UTC_TIMESTAMP(6)),
('d0000005-0000-4000-8000-000000000003','pro-model','produksiyon','MODEL','4k',225,0,1,UTC_TIMESTAMP(6)),
('d0000006-0000-4000-8000-000000000001','pro-tryon','produksiyon','TRY ON','1k',6,0,1,UTC_TIMESTAMP(6)),
('d0000006-0000-4000-8000-000000000002','pro-tryon','produksiyon','TRY ON','2k',9,0,1,UTC_TIMESTAMP(6)),
('d0000006-0000-4000-8000-000000000003','pro-tryon','produksiyon','TRY ON','4k',12,0,1,UTC_TIMESTAMP(6)),
('d0000007-0000-4000-8000-000000000001','pro-edit','produksiyon','EDIT','1k',57,0,1,UTC_TIMESTAMP(6)),
('d0000007-0000-4000-8000-000000000002','pro-edit','produksiyon','EDIT','2k',95,0,1,UTC_TIMESTAMP(6)),
('d0000007-0000-4000-8000-000000000003','pro-edit','produksiyon','EDIT','4k',143,0,1,UTC_TIMESTAMP(6)),
('d0000008-0000-4000-8000-000000000001','pro-decoupe','produksiyon','DECOUPE','1k',6,0,1,UTC_TIMESTAMP(6)),
('d0000008-0000-4000-8000-000000000002','pro-decoupe','produksiyon','DECOUPE','2k',9,0,1,UTC_TIMESTAMP(6)),
('d0000008-0000-4000-8000-000000000003','pro-decoupe','produksiyon','DECOUPE','4k',12,0,1,UTC_TIMESTAMP(6)),
('d0000009-0000-4000-8000-000000000001','pro-editorial','produksiyon','EDITORIAL','1k',66,0,1,UTC_TIMESTAMP(6)),
('d0000009-0000-4000-8000-000000000002','pro-editorial','produksiyon','EDITORIAL','2k',110,0,1,UTC_TIMESTAMP(6)),
('d0000009-0000-4000-8000-000000000003','pro-editorial','produksiyon','EDITORIAL','4k',165,0,1,UTC_TIMESTAMP(6)),
('d0000010-0000-4000-8000-000000000001','pro-moodboard','produksiyon','MOODBOARD','1k',39,0,1,UTC_TIMESTAMP(6)),
('d0000010-0000-4000-8000-000000000002','pro-moodboard','produksiyon','MOODBOARD','2k',65,0,1,UTC_TIMESTAMP(6)),
('d0000010-0000-4000-8000-000000000003','pro-moodboard','produksiyon','MOODBOARD','4k',98,0,1,UTC_TIMESTAMP(6)),
('d0000011-0000-4000-8000-000000000001','pro-swap','produksiyon','SWAP','1k',54,0,1,UTC_TIMESTAMP(6)),
('d0000011-0000-4000-8000-000000000002','pro-swap','produksiyon','SWAP','2k',90,0,1,UTC_TIMESTAMP(6)),
('d0000011-0000-4000-8000-000000000003','pro-swap','produksiyon','SWAP','4k',135,0,1,UTC_TIMESTAMP(6)),
('d0000012-0000-4000-8000-000000000001','pro-pose','produksiyon','POSE','1k',42,0,1,UTC_TIMESTAMP(6)),
('d0000012-0000-4000-8000-000000000002','pro-pose','produksiyon','POSE','2k',70,0,1,UTC_TIMESTAMP(6)),
('d0000012-0000-4000-8000-000000000003','pro-pose','produksiyon','POSE','4k',105,0,1,UTC_TIMESTAMP(6)),
('d0000013-0000-4000-8000-000000000001','pro-angle','produksiyon','ANGLE','1k',36,0,1,UTC_TIMESTAMP(6)),
('d0000013-0000-4000-8000-000000000002','pro-angle','produksiyon','ANGLE','2k',60,0,1,UTC_TIMESTAMP(6)),
('d0000013-0000-4000-8000-000000000003','pro-angle','produksiyon','ANGLE','4k',90,0,1,UTC_TIMESTAMP(6)),
('d0000014-0000-4000-8000-000000000001','pro-video','produksiyon','VIDEO','1k',108,0,1,UTC_TIMESTAMP(6)),
('d0000014-0000-4000-8000-000000000002','pro-video','produksiyon','VIDEO','2k',180,0,1,UTC_TIMESTAMP(6)),
('d0000014-0000-4000-8000-000000000003','pro-video','produksiyon','VIDEO','4k',270,0,1,UTC_TIMESTAMP(6));

INSERT IGNORE INTO `ChangelogEntries` (`Id`, `Title`, `Type`, `Summary`, `PublishedAtUtc`) VALUES
('e0000001-0000-4000-8000-000000000001','Studio job queue eklendi','feature','Oluştur aksiyonu backend job kuyruğuna yazılıyor ve kredi düşümü yapılıyor.',UTC_TIMESTAMP(6)),
('e0000002-0000-4000-8000-000000000001','Gerçek auth kontrolü','security','Register/login akışı şifre hash doğrulaması ile backend''e taşındı.',UTC_TIMESTAMP(6)),
('e0000003-0000-4000-8000-000000000001','Tool kataloğu seed edildi','improvement','FAST ve PRO araçlarının kredi maliyetleri veritabanına eklendi.',UTC_TIMESTAMP(6));

SET FOREIGN_KEY_CHECKS = 1;
