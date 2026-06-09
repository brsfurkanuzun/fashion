-- NulaDesign / Fashion — başlangıç verileri
-- Admin giriş: admin / admin  (email: admin@fashion.local)

BEGIN;

-- Admin kullanıcı
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "DisplayName", "Role", "CreatedAtUtc")
VALUES (
    'a0000000-0000-4000-8000-000000000001',
    'admin@fashion.local',
    '100000.So8sEZ5VdwO6bR+IRMKQWg==.5esf5PVGXuuMrLv/RFDqmNxRlJYjOQZc1q5tyuC5PH8=',
    'Admin',
    'admin',
    NOW() AT TIME ZONE 'UTC'
)
ON CONFLICT DO NOTHING;

INSERT INTO "CreditWallets" ("Id", "UserId", "Balance")
VALUES (
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    500
)
ON CONFLICT DO NOTHING;

INSERT INTO "CreditTransactions" ("Id", "UserId", "Amount", "Type", "Description", "CreatedAtUtc")
VALUES (
    'c0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    500,
    1,
    'Initial seed credits',
    NOW() AT TIME ZONE 'UTC'
)
ON CONFLICT DO NOTHING;

-- Tool kataloğu (14 tool × 3 kalite = 42 satır)
INSERT INTO "ToolDefinitions"
    ("Id", "ToolKey", "Workspace", "Label", "Quality", "CreditCost", "IsNew", "IsActive", "CreatedAtUtc")
VALUES
    -- FAST / cekim
    ('d0000001-0000-4000-8000-000000000001', 'cekim-model',     'cekim',       'MODEL\TRY ON',  '1k', 24,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000001-0000-4000-8000-000000000002', 'cekim-model',     'cekim',       'MODEL\TRY ON',  '2k', 40,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000001-0000-4000-8000-000000000003', 'cekim-model',     'cekim',       'MODEL\TRY ON',  '4k', 60,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000002-0000-4000-8000-000000000001', 'cekim-editorial', 'cekim',       'EDITORIAL',     '1k', 33,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000002-0000-4000-8000-000000000002', 'cekim-editorial', 'cekim',       'EDITORIAL',     '2k', 55,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000002-0000-4000-8000-000000000003', 'cekim-editorial', 'cekim',       'EDITORIAL',     '4k', 83,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000003-0000-4000-8000-000000000001', 'cekim-pose',      'cekim',       'POSE',          '1k', 18,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000003-0000-4000-8000-000000000002', 'cekim-pose',      'cekim',       'POSE',          '2k', 30,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000003-0000-4000-8000-000000000003', 'cekim-pose',      'cekim',       'POSE',          '4k', 45,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000004-0000-4000-8000-000000000001', 'cekim-video',     'cekim',       'VIDEO',         '1k', 48,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000004-0000-4000-8000-000000000002', 'cekim-video',     'cekim',       'VIDEO',         '2k', 80,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000004-0000-4000-8000-000000000003', 'cekim-video',     'cekim',       'VIDEO',         '4k', 120, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    -- PRO / produksiyon
    ('d0000005-0000-4000-8000-000000000001', 'pro-model',       'produksiyon', 'MODEL',         '1k', 90,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000005-0000-4000-8000-000000000002', 'pro-model',       'produksiyon', 'MODEL',         '2k', 150, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000005-0000-4000-8000-000000000003', 'pro-model',       'produksiyon', 'MODEL',         '4k', 225, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000006-0000-4000-8000-000000000001', 'pro-tryon',       'produksiyon', 'TRY ON',        '1k', 6,   FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000006-0000-4000-8000-000000000002', 'pro-tryon',       'produksiyon', 'TRY ON',        '2k', 9,   FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000006-0000-4000-8000-000000000003', 'pro-tryon',       'produksiyon', 'TRY ON',        '4k', 12,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000007-0000-4000-8000-000000000001', 'pro-edit',        'produksiyon', 'EDIT',          '1k', 57,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000007-0000-4000-8000-000000000002', 'pro-edit',        'produksiyon', 'EDIT',          '2k', 95,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000007-0000-4000-8000-000000000003', 'pro-edit',        'produksiyon', 'EDIT',          '4k', 143, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000008-0000-4000-8000-000000000001', 'pro-decoupe',     'produksiyon', 'DECOUPE',       '1k', 6,   FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000008-0000-4000-8000-000000000002', 'pro-decoupe',     'produksiyon', 'DECOUPE',       '2k', 9,   FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000008-0000-4000-8000-000000000003', 'pro-decoupe',     'produksiyon', 'DECOUPE',       '4k', 12,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000009-0000-4000-8000-000000000001', 'pro-editorial',   'produksiyon', 'EDITORIAL',     '1k', 66,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000009-0000-4000-8000-000000000002', 'pro-editorial',   'produksiyon', 'EDITORIAL',     '2k', 110, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000009-0000-4000-8000-000000000003', 'pro-editorial',   'produksiyon', 'EDITORIAL',     '4k', 165, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000010-0000-4000-8000-000000000001', 'pro-moodboard',   'produksiyon', 'MOODBOARD',     '1k', 39,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000010-0000-4000-8000-000000000002', 'pro-moodboard',   'produksiyon', 'MOODBOARD',     '2k', 65,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000010-0000-4000-8000-000000000003', 'pro-moodboard',   'produksiyon', 'MOODBOARD',     '4k', 98,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000011-0000-4000-8000-000000000001', 'pro-swap',        'produksiyon', 'SWAP',          '1k', 54,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000011-0000-4000-8000-000000000002', 'pro-swap',        'produksiyon', 'SWAP',          '2k', 90,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000011-0000-4000-8000-000000000003', 'pro-swap',        'produksiyon', 'SWAP',          '4k', 135, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000012-0000-4000-8000-000000000001', 'pro-pose',        'produksiyon', 'POSE',          '1k', 42,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000012-0000-4000-8000-000000000002', 'pro-pose',        'produksiyon', 'POSE',          '2k', 70,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000012-0000-4000-8000-000000000003', 'pro-pose',        'produksiyon', 'POSE',          '4k', 105, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000013-0000-4000-8000-000000000001', 'pro-angle',       'produksiyon', 'ANGLE',         '1k', 36,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000013-0000-4000-8000-000000000002', 'pro-angle',       'produksiyon', 'ANGLE',         '2k', 60,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000013-0000-4000-8000-000000000003', 'pro-angle',       'produksiyon', 'ANGLE',         '4k', 90,  FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000014-0000-4000-8000-000000000001', 'pro-video',       'produksiyon', 'VIDEO',         '1k', 108, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000014-0000-4000-8000-000000000002', 'pro-video',       'produksiyon', 'VIDEO',         '2k', 180, FALSE, TRUE, NOW() AT TIME ZONE 'UTC'),
    ('d0000014-0000-4000-8000-000000000003', 'pro-video',       'produksiyon', 'VIDEO',         '4k', 270, FALSE, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT DO NOTHING;

-- Changelog
INSERT INTO "ChangelogEntries" ("Id", "Title", "Type", "Summary", "PublishedAtUtc")
VALUES
    (
        'e0000001-0000-4000-8000-000000000001',
        'Studio job queue eklendi',
        'feature',
        'Oluştur aksiyonu backend job kuyruğuna yazılıyor ve kredi düşümü yapılıyor.',
        NOW() AT TIME ZONE 'UTC'
    ),
    (
        'e0000002-0000-4000-8000-000000000001',
        'Gerçek auth kontrolü',
        'security',
        'Register/login akışı şifre hash doğrulaması ile backend''e taşındı.',
        NOW() AT TIME ZONE 'UTC'
    ),
    (
        'e0000003-0000-4000-8000-000000000001',
        'Tool kataloğu seed edildi',
        'improvement',
        'FAST ve PRO araçlarının kredi maliyetleri veritabanına eklendi.',
        NOW() AT TIME ZONE 'UTC'
    )
ON CONFLICT DO NOTHING;

COMMIT;
