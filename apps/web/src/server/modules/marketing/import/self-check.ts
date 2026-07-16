import * as XLSX from "xlsx";
import { mapAdsRows } from "./mappers/ads.mapper";
import { readTabularFile, ImportFileError } from "./parsers/file-reader";
import { normalizeImportPhone, parseImportDate, parseImportNumber } from "./utils";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Marketing import self-check gagal: ${message}`);
}

async function workbookFile(includeSpend = true): Promise<File> {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Petunjuk laporan"], ["Bukan tabel data"]]), "Petunjuk");
  const metadata = Array.from({ length: 22 }, (_, index) => [`Metadata ${index + 1}`]);
  const headers = ["Date", "Campaign name", "Ad group name", "Ad name", ...(includeSpend ? ["Cost"] : []), "Complete payment value", "Impressions"];
  const row = [46218, "Campaign Juli", "Grup Diabetes", "Iklan Herbal", ...(includeSpend ? [1234.56] : []), 9876.54, "—"];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([...metadata, headers, row]), "TikTok Ads");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new File([buffer], "tiktok-ads.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

async function run() {
  assert(parseImportDate("15/07/2026") === "2026-07-15", "tanggal lokal");
  assert(parseImportDate("46218") === "2026-07-15", "tanggal Excel");
  assert(parseImportNumber("1.234,56") === 1234.56, "angka Indonesia");
  assert(normalizeImportPhone("81234567890") === "6281234567890", "nomor HP awalan 8");

  const tabular = await readTabularFile(await workbookFile(), "ads");
  const parsed = mapAdsRows(tabular.rows, tabular.headers, "tiktok", "ADV Preview");
  const first = parsed.rows[0]!;
  assert(tabular.headers[0] === "Date", "memilih sheet dan header TikTok");
  assert(first.parsed.reportDate === "2026-07-15", "tanggal XLSX");
  assert(first.parsed.adset === "Grup Diabetes", "ad group");
  assert(first.parsed.adName === "Iklan Herbal", "ad name");
  assert(first.parsed.spend === 1235, "spending raw XLSX");
  assert(first.parsed.purchaseValue === 9876.54, "nilai pembelian");
  assert(first.parsed.impressions === null && first.status === "valid", "placeholder opsional");
  assert(first.raw["Campaign name"] === "Campaign Juli", "raw source dipertahankan");
  assert(parsed.columns[0] === "Tanggal", "tanggal menjadi kolom pertama");

  let rejected = false;
  try { await readTabularFile(await workbookFile(false), "ads"); }
  catch (error) { rejected = error instanceof ImportFileError && /spending/i.test(error.message) && /TikTok Ads/.test(error.message); }
  assert(rejected, "file tanpa spending ditolak sekali dengan pesan jelas");
  console.log("Marketing import self-check berhasil.");
}

void run();
