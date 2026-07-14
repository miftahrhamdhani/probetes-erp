-- ============================================================================
-- Migrasi 03: audit perubahan, merge customer ter-review, dan alias mapping.
-- Aman dijalankan ulang pada database probetes_erp yang sudah ada.
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.change_log (
    change_id   BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   TEXT NOT NULL,
    action      TEXT NOT NULL,
    before_data JSONB,
    after_data  JSONB,
    changed_by  TEXT DEFAULT 'app',
    changed_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_change_log_record ON audit.change_log(table_name, record_id);

CREATE TABLE IF NOT EXISTS audit.customer_merges (
    merge_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_customer_id    TEXT NOT NULL REFERENCES master.customers(customer_id),
    target_customer_id    TEXT NOT NULL REFERENCES master.customers(customer_id),
    status                TEXT NOT NULL DEFAULT 'merged',
    source_customer       JSONB NOT NULL,
    source_cohort         JSONB,
    affected_records      JSONB NOT NULL DEFAULT '{}'::jsonb,
    merged_by             TEXT DEFAULT 'app',
    merged_at             TIMESTAMPTZ DEFAULT now(),
    restored_at           TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS master.product_aliases (
    alias_id      BIGSERIAL PRIMARY KEY,
    original_name TEXT NOT NULL UNIQUE,
    product_id    TEXT REFERENCES master.products(product_id),
    status        TEXT NOT NULL DEFAULT 'review',
    source        TEXT,
    updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS master.channel_aliases (
    alias_id      BIGSERIAL PRIMARY KEY,
    original_name TEXT NOT NULL UNIQUE,
    channel_id    TEXT REFERENCES master.channels(channel_id),
    status        TEXT NOT NULL DEFAULT 'review',
    source        TEXT,
    updated_at    TIMESTAMPTZ DEFAULT now()
);
