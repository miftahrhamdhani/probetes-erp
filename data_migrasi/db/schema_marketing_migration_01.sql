-- ============================================================================
-- Migrasi Marketing 01: import iklan (Meta Ads dsb).
-- Idempotent: aman dijalankan ulang (CREATE SCHEMA/TABLE IF NOT EXISTS).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS marketing;

CREATE TABLE IF NOT EXISTS marketing.ad_import_batches (
    batch_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name          TEXT NOT NULL,
    file_label         TEXT,
    platform           TEXT DEFAULT 'Meta Ads',
    product_label      TEXT,
    account_code       TEXT,
    advertiser_name    TEXT,
    report_month       TEXT,
    report_year        INTEGER,
    status             TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
    total_rows         INTEGER DEFAULT 0,
    success_rows       INTEGER DEFAULT 0,
    failed_rows        INTEGER DEFAULT 0,
    imported_by        TEXT,
    imported_at        TIMESTAMPTZ DEFAULT now(),
    processed_at       TIMESTAMPTZ,
    error_message      TEXT,
    raw_file_metadata  JSONB
);

CREATE TABLE IF NOT EXISTS marketing.ad_campaign_metrics (
    metric_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id                     UUID REFERENCES marketing.ad_import_batches(batch_id) ON DELETE CASCADE,
    report_start_date            DATE,
    report_end_date              DATE,
    report_date                  DATE,

    platform                     TEXT DEFAULT 'Meta Ads',
    campaign_name                TEXT NOT NULL,
    campaign_created_at          DATE,
    campaign_delivery_status     TEXT,

    product_label                TEXT,
    account_code                 TEXT,
    advertiser_name              TEXT,
    report_month                 TEXT,

    budget_value                 NUMERIC(18,2),
    budget_type                  TEXT,

    spend                        NUMERIC(18,2) DEFAULT 0,
    checkout_started              NUMERIC(18,2) DEFAULT 0,
    cost_per_checkout             NUMERIC(18,2),
    purchases                    NUMERIC(18,2) DEFAULT 0,
    cost_per_purchase            NUMERIC(18,2),
    purchase_value                NUMERIC(18,2) DEFAULT 0,
    platform_roas                 NUMERIC(18,6),
    link_clicks                   NUMERIC(18,2) DEFAULT 0,
    cpc_link                      NUMERIC(18,2),
    landing_page_views            NUMERIC(18,2) DEFAULT 0,
    cost_per_landing_page_view    NUMERIC(18,2),
    ctr_link                       NUMERIC(18,6),
    reach                         NUMERIC(18,2) DEFAULT 0,
    impressions                   NUMERIC(18,2) DEFAULT 0,
    cpm                          NUMERIC(18,2),
    frequency                    NUMERIC(18,6),
    add_to_cart                   NUMERIC(18,2),
    leads                        NUMERIC(18,2),
    cost_per_lead                 NUMERIC(18,2),
    video_3s_views                NUMERIC(18,2),
    thruplays                    NUMERIC(18,2),
    avg_watch_time                NUMERIC(18,2),
    video_played_25               NUMERIC(18,2),
    video_played_50               NUMERIC(18,2),
    video_played_75               NUMERIC(18,2),
    video_played_95               NUMERIC(18,2),

    source_file_name              TEXT,
    raw_data                      JSONB,
    created_at                    TIMESTAMPTZ DEFAULT now(),
    updated_at                    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_metrics_report_start ON marketing.ad_campaign_metrics(report_start_date);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_report_end   ON marketing.ad_campaign_metrics(report_end_date);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_platform      ON marketing.ad_campaign_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign_name ON marketing.ad_campaign_metrics(campaign_name);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_batch_id      ON marketing.ad_campaign_metrics(batch_id);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_product_label ON marketing.ad_campaign_metrics(product_label);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_advertiser     ON marketing.ad_campaign_metrics(advertiser_name);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_account_code   ON marketing.ad_campaign_metrics(account_code);
