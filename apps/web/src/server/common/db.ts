// Koneksi PostgreSQL bersama untuk seluruh backend (server/modules).
// Sumber sebenarnya masih di src/lib/db.ts agar tidak memutus import lama;
// modul baru cukup mengimpor dari sini.
export { pool, query } from "@/lib/db";
