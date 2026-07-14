import { query } from "@/server/common/db";
import { AppError } from "@/server/common/errors";
import { extractCityFromAddress } from "@/server/common/utils/location";
import {
  HP_ADA,
  HP_DIGITS,
  HP_RAW,
  HP_TIDAK_NORMAL_WHERE,
  KOTA_KOSONG_WHERE,
  NAMA_BERMASALAH_WHERE,
} from "./quality-sql";

// Kualitas Data hanya menampilkan MASALAH NYATA yang bisa ditindaklanjuti tim.
// Data marketplace yang wajar tanpa HP/alamat TIDAK dihitung sebagai masalah.
export type SectionId = "produk-nama" | "produk-kategori" | "pelanggan" | "hp" | "kota";

const PRODUK_NAMA_SQL = `
  SELECT
    product_id AS id,
    COALESCE(NULLIF(product_final_name, ''), '-') AS product,
    COALESCE(NULLIF(original_names, ''), '-') AS original,
    COALESCE(qty_total, 0) AS qty,
    COALESCE(value_total, 0) AS value,
    'Nama bervariasi / prefiks / encoding' AS issue,
    'Gabungkan ke nama produk final yang benar' AS suggestion
  FROM master.products
  WHERE status = 'review'
  ORDER BY value_total DESC NULLS LAST
`;

const PRODUK_KATEGORI_SQL = `
  SELECT
    product_id AS id,
    COALESCE(NULLIF(product_final_name, ''), '-') AS product,
    COALESCE(NULLIF(original_names, ''), '-') AS original,
    COALESCE(qty_total, 0) AS qty,
    COALESCE(value_total, 0) AS value,
    'Kategori belum ditentukan' AS issue,
    'Tentukan: digital / hp_amandia / fisik_lain' AS suggestion
  FROM master.products
  WHERE NULLIF(category, '') IS NULL
  ORDER BY value_total DESC NULLS LAST
`;

const PELANGGAN_SQL = `
  WITH dominant_channel AS (
    SELECT customer_id, channel_id FROM (
      SELECT o.customer_id, o.channel_id,
        ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY count(*) DESC) AS rn
      FROM orders.orders o WHERE o.channel_id IS NOT NULL
      GROUP BY o.customer_id, o.channel_id
    ) t WHERE rn = 1
  )
  SELECT
    cu.customer_id AS id,
    COALESCE(NULLIF(cu.name, ''), '-') AS name,
    COALESCE(NULLIF(cu.phone_normalized, ''), NULLIF(cu.phone, ''), '-') AS phone,
    COALESCE(NULLIF(cu.address, ''), '-') AS address,
    COALESCE(NULLIF(cu.city, ''), '-') AS city,
    COALESCE(NULLIF(cu.province, ''), '-') AS province,
    CASE
      WHEN ch.channel_final_name IS NULL OR ch.channel_final_name = 'Unknown' THEN 'Belum Tercatat'
      ELSE ch.channel_final_name
    END AS source,
    COALESCE(cu.transaction_count, 0) AS trx,
    CASE
      WHEN cu.name IS NULL OR trim(cu.name) = '' THEN 'Nama kosong'
      WHEN upper(cu.name) LIKE '%ERROR%' THEN 'Nama tidak terbaca'
      ELSE 'Nama terlalu pendek'
    END AS issue
  FROM (SELECT * FROM master.customers WHERE ${NAMA_BERMASALAH_WHERE}) cu
  LEFT JOIN dominant_channel dc ON dc.customer_id = cu.customer_id
  LEFT JOIN master.channels ch ON ch.channel_id = dc.channel_id
  ORDER BY cu.customer_id
`;

const HP_SQL = `
  WITH phones AS (
    SELECT
      customer_id,
      COALESCE(NULLIF(name, ''), '-') AS name,
      ${HP_RAW} AS raw,
      ${HP_DIGITS} AS digits
    FROM master.customers
    WHERE ${HP_ADA}
  )
  SELECT
    customer_id AS id, name, raw AS phone, length(digits) AS length,
    CASE
      WHEN raw !~ '^[0-9+ ()-]*$' THEN 'Berisi karakter selain angka'
      WHEN digits NOT LIKE '62%' THEN 'Tidak diawali 62'
      WHEN length(digits) < 10 THEN 'Nomor terlalu pendek'
      WHEN length(digits) > 15 THEN 'Nomor terlalu panjang'
      ELSE 'Format perlu dicek'
    END AS issue
  FROM phones
  WHERE digits !~ '^62[0-9]{8,13}$'
  ORDER BY customer_id
`;

const KOTA_SQL = `
  SELECT
    customer_id AS id,
    COALESCE(NULLIF(name, ''), '-') AS name,
    COALESCE(NULLIF(address, ''), '-') AS address,
    COALESCE(NULLIF(province, ''), '-') AS province,
    'Kota belum terbaca dari alamat' AS issue
  FROM master.customers
  WHERE ${KOTA_KOSONG_WHERE}
  ORDER BY customer_id
`;

const sectionSql: Record<SectionId, string> = {
  "produk-nama": PRODUK_NAMA_SQL,
  "produk-kategori": PRODUK_KATEGORI_SQL,
  pelanggan: PELANGGAN_SQL,
  hp: HP_SQL,
  kota: KOTA_SQL,
};

const countSql: Record<SectionId, string> = {
  "produk-nama": `SELECT count(*)::int AS count FROM master.products WHERE status = 'review'`,
  "produk-kategori": `SELECT count(*)::int AS count FROM master.products WHERE NULLIF(category,'') IS NULL`,
  pelanggan: `SELECT count(*)::int AS count FROM master.customers WHERE ${NAMA_BERMASALAH_WHERE}`,
  hp: `SELECT count(*)::int AS count FROM master.customers WHERE ${HP_TIDAK_NORMAL_WHERE}`,
  kota: `SELECT count(*)::int AS count FROM master.customers WHERE ${KOTA_KOSONG_WHERE}`,
};

export function isSectionId(value: string): value is SectionId {
  return value in sectionSql;
}

async function count(section: SectionId): Promise<number> {
  const rows = await query<{ count: number }>(countSql[section]);
  return rows[0]?.count ?? 0;
}

export async function getQualitySummary() {
  const [produkNama, produkKategori, pelanggan, hp, kota] = await Promise.all([
    count("produk-nama"),
    count("produk-kategori"),
    count("pelanggan"),
    count("hp"),
    count("kota"),
  ]);
  return { "produk-nama": produkNama, "produk-kategori": produkKategori, pelanggan, hp, kota };
}

export async function getQualitySection(section: string) {
  if (!isSectionId(section)) throw new AppError("Jenis kualitas data tidak dikenal.", 400);
  if (section === "kota") {
    // Sertakan kota hasil ekstraksi ulang agar terlihat mana yang benar-benar buntu.
    const rows = await query<{ address: string }>(sectionSql.kota);
    return rows.map((r) => ({
      ...r,
      city_terbaca: extractCityFromAddress(String(r.address ?? ""), "") || "-",
    }));
  }
  return query(sectionSql[section]);
}
