import { Pool, types } from "pg";

// pg mengembalikan BIGINT (OID 20) sebagai string demi presisi. Nilai Probetes
// (maks ~Rp7 miliar) jauh di bawah Number.MAX_SAFE_INTEGER, jadi aman diparse
// ke number agar frontend bisa sort numerik & format Rupiah dengan benar.
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

/**
 * Koneksi PostgreSQL (pool) untuk API routes.
 * Pool disimpan di globalThis agar tidak dibuat ulang tiap hot-reload saat dev.
 * Konfigurasi via DATABASE_URL di apps/web/.env.local.
 */
const globalForPg = globalThis as unknown as { __pgPool?: Pool };

export const pool =
  globalForPg.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.__pgPool = pool;
}

/** Jalankan query dan kembalikan array baris. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
