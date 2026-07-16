-- ============================================================================
-- Migrasi Marketing 03: lengkapi field baku order hasil import marketplace.
-- Additive + idempotent: tidak menghapus atau mengubah data existing.
-- ============================================================================

BEGIN;

ALTER TABLE orders.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT;

COMMENT ON COLUMN orders.orders.payment_status IS
  'Status pembayaran baku dari marketplace/Scalev; sumber mentah tetap di staging.import_rows.';

COMMIT;
