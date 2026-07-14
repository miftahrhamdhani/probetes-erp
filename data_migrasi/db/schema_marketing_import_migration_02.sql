-- ============================================================================
-- Migrasi Marketing 02: preview, validasi, staging, dan riwayat import channel.
-- Additive + idempotent: tidak menghapus atau mereset data existing.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS marketing;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS marketing.import_source_options (
    option_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform        TEXT NOT NULL CHECK (platform IN ('tiktok', 'shopee', 'meta')),
    option_type     TEXT NOT NULL CHECK (option_type IN ('adv', 'store')),
    label           TEXT NOT NULL,
    user_id         TEXT REFERENCES master.users(user_id) ON DELETE SET NULL,
    channel_id      TEXT REFERENCES master.channels(channel_id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_import_source_option_active
    ON marketing.import_source_options (platform, option_type, lower(label))
    WHERE is_active;

-- ADV berasal dari master.users. Tabel ini hanya mengatur ketersediaannya per
-- platform pada layar import, bukan menggandakan data profil user.
INSERT INTO marketing.import_source_options (platform, option_type, label, user_id)
SELECT p.platform, 'adv', u.name, u.user_id
FROM master.users u
CROSS JOIN (VALUES ('tiktok'), ('shopee'), ('meta')) AS p(platform)
WHERE u.status = 'Aktif'
  AND upper(coalesce(u.role, '')) IN ('ADV', 'ADV/CS')
  AND nullif(trim(u.name), '') IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM marketing.import_source_options o
      WHERE o.platform = p.platform
        AND o.option_type = 'adv'
        AND lower(o.label) = lower(u.name)
        AND o.is_active
  );

-- Nama toko ini berasal dari konfigurasi yang sudah tampil pada frontend.
-- Setelah migrasi, tambah/edit/hapus dilakukan melalui API dan persisten.
INSERT INTO marketing.import_source_options (platform, option_type, label)
SELECT v.platform, 'store', v.label
FROM (VALUES
    ('tiktok', 'Probetes'),
    ('tiktok', 'Amandia'),
    ('shopee', 'Probetes Herbal'),
    ('meta', 'Akuisisi (Skalev)')
) AS v(platform, label)
WHERE NOT EXISTS (
    SELECT 1
    FROM marketing.import_source_options o
    WHERE o.platform = v.platform
      AND o.option_type = 'store'
      AND lower(o.label) = lower(v.label)
      AND o.is_active
);

CREATE TABLE IF NOT EXISTS marketing.import_batches (
    batch_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform            TEXT NOT NULL CHECK (platform IN ('tiktok', 'shopee', 'meta')),
    import_type         TEXT NOT NULL CHECK (import_type IN ('ads', 'order')),
    file_name           TEXT NOT NULL,
    file_size           BIGINT NOT NULL DEFAULT 0,
    file_mime           TEXT,
    adv_option_id       UUID REFERENCES marketing.import_source_options(option_id) ON DELETE SET NULL,
    adv_id              TEXT REFERENCES master.users(user_id) ON DELETE SET NULL,
    adv_name            TEXT,
    store_option_id     UUID REFERENCES marketing.import_source_options(option_id) ON DELETE SET NULL,
    store_name          TEXT,
    period_label        TEXT,
    period_start        DATE,
    period_end          DATE,
    note                TEXT,
    status              TEXT NOT NULL DEFAULT 'preview'
                        CHECK (status IN ('preview', 'processing', 'completed', 'cancelled', 'failed', 'expired')),
    total_rows          INTEGER NOT NULL DEFAULT 0,
    valid_rows          INTEGER NOT NULL DEFAULT 0,
    review_rows         INTEGER NOT NULL DEFAULT 0,
    error_rows          INTEGER NOT NULL DEFAULT 0,
    duplicate_rows      INTEGER NOT NULL DEFAULT 0,
    imported_rows       INTEGER NOT NULL DEFAULT 0,
    failed_rows         INTEGER NOT NULL DEFAULT 0,
    validation_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    file_metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
    imported_by         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    committed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    error_message       TEXT
);

CREATE INDEX IF NOT EXISTS idx_import_batches_created_at
    ON marketing.import_batches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_batches_status
    ON marketing.import_batches (status);
CREATE INDEX IF NOT EXISTS idx_import_batches_source
    ON marketing.import_batches (platform, import_type);

CREATE TABLE IF NOT EXISTS staging.import_rows (
    row_id              BIGSERIAL PRIMARY KEY,
    batch_id            UUID NOT NULL REFERENCES marketing.import_batches(batch_id) ON DELETE CASCADE,
    row_number          INTEGER NOT NULL,
    raw_data            JSONB NOT NULL,
    parsed_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_data        JSONB NOT NULL DEFAULT '{}'::jsonb,
    validation_status   TEXT NOT NULL DEFAULT 'review'
                        CHECK (validation_status IN ('valid', 'review', 'error', 'duplicate')),
    validation_notes    JSONB NOT NULL DEFAULT '[]'::jsonb,
    duplicate_key       TEXT,
    target_entity       TEXT,
    promoted_id         TEXT,
    promoted_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (batch_id, row_number)
);

CREATE INDEX IF NOT EXISTS idx_import_rows_batch_status
    ON staging.import_rows (batch_id, validation_status);
CREATE INDEX IF NOT EXISTS idx_import_rows_duplicate_key
    ON staging.import_rows (duplicate_key)
    WHERE duplicate_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit.import_logs (
    log_id          BIGSERIAL PRIMARY KEY,
    batch_id        UUID NOT NULL REFERENCES marketing.import_batches(batch_id) ON DELETE CASCADE,
    action          TEXT NOT NULL CHECK (action IN ('preview', 'commit', 'cancel', 'fail')),
    actor            TEXT,
    detail           JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_logs_batch_created
    ON audit.import_logs (batch_id, created_at DESC);
