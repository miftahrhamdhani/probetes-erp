-- ============================================================================
-- Probetes ERP - Skema Sistem (bukan data bisnis)
-- Menyimpan pengaturan aplikasi & riwayat cadangan database.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS system;

-- Pengaturan cadangan. Selalu 1 baris (id=1), di-UPDATE tiap kali user ubah.
CREATE TABLE IF NOT EXISTS system.backup_settings (
    id            INTEGER PRIMARY KEY DEFAULT 1,
    schedule      TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'daily' | 'weekly' | 'monthly'
    folder_path   TEXT NOT NULL DEFAULT 'D:\PROBETES\CADANGAN DATABASE',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1),
    CONSTRAINT valid_schedule CHECK (schedule IN ('manual', 'daily', 'weekly', 'monthly'))
);

INSERT INTO system.backup_settings (id, schedule, folder_path)
VALUES (1, 'manual', 'D:\PROBETES\CADANGAN DATABASE')
ON CONFLICT (id) DO NOTHING;

-- Riwayat tiap kali cadangan dijalankan (manual atau otomatis).
CREATE TABLE IF NOT EXISTS system.backup_history (
    id           BIGSERIAL PRIMARY KEY,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at  TIMESTAMPTZ,
    trigger_type TEXT NOT NULL, -- 'manual' | 'scheduled'
    status       TEXT NOT NULL DEFAULT 'running', -- 'running' | 'success' | 'failed'
    folder_path  TEXT,
    total_rows   BIGINT,
    total_files  INTEGER,
    error_message TEXT,
    backup_mode  TEXT NOT NULL DEFAULT 'all', -- 'all' | 'range'
    date_from    DATE, -- diisi jika backup_mode = 'range'
    date_to      DATE
);

CREATE INDEX IF NOT EXISTS idx_backup_history_started_at ON system.backup_history (started_at DESC);
