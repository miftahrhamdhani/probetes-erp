-- ============================================================================
-- Migrasi 02: dukungan mode cadangan (semua data / rentang tanggal)
-- ============================================================================

ALTER TABLE system.backup_history
    ADD COLUMN IF NOT EXISTS backup_mode TEXT NOT NULL DEFAULT 'all', -- 'all' | 'range'
    ADD COLUMN IF NOT EXISTS date_from DATE,
    ADD COLUMN IF NOT EXISTS date_to DATE;
