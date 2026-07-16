import type { ImportValidationStatus, ParsedImportFile, ParsedImportRow } from "../import.types";

/** Naikkan status baris ke tingkat lebih parah (error mengalahkan review). */
export function escalateStatus(current: ImportValidationStatus, next: "review" | "error"): ImportValidationStatus {
  if (current === "error" || next === "error") return "error";
  return "review";
}

/** Kolom inti tetap stabil agar tanggal selalu menjadi kolom pertama. */
const ADS_COLUMNS = [
  "Tanggal", "Tanggal Akhir", "Cakupan Laporan", "Platform", "ADV", "Campaign", "Waktu Dibuat Campaign",
  "Adset / Grup Iklan", "Nama Iklan / Judul Video", "ID Iklan / Video", "Waktu Posting Video",
  "ID Campaign", "ID Produk", "Spending", "Nilai Konversi Platform", "Impression / Tayangan", "Click", "Konversi / Pesanan", "Status",
];
const ORDER_COLUMNS = [
  "Tanggal Pesanan", "Platform", "Toko", "No Invoice", "No Resi", "Customer", "No HP", "Email", "Produk", "Qty",
  "Harga Produk", "Total Bayar", "Metode Bayar", "Status Pesanan", "Tipe Pelanggan",
];

/** Rangkum baris hasil parsing jadi ParsedImportFile (kolom + periode + error file). */
export function finalizeFile(headers: string[], rows: ParsedImportRow[], fileErrors: string[]): ParsedImportFile {
  const dates = rows
    .flatMap((row) => [row.parsed.reportDate, row.parsed.reportEndDate, row.parsed.orderDate])
    .map((date) => String(date ?? ""))
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();
  const preferred = rows.some((row) => row.targetEntity === "ad_campaign_metrics") ? ADS_COLUMNS : ORDER_COLUMNS;
  const available = new Set(rows.flatMap((row) => Object.keys(row.display)));
  const columns = [
    ...preferred,
    ...headers.filter((column) => !preferred.includes(column)),
    ...[...available].filter((column) => !preferred.includes(column) && !headers.includes(column)),
    "Status Validasi",
    "Catatan Validasi",
  ];
  return {
    headers,
    columns,
    rows,
    periodStart: dates[0] ?? null,
    periodEnd: dates.at(-1) ?? null,
    fileErrors,
  };
}
