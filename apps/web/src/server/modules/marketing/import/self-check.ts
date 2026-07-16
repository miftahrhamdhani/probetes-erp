import * as XLSX from "xlsx";
import { mapAdsRows } from "./mappers/ads.mapper";
import { mapOrderRows } from "./mappers/order.mapper";
import { detectPlatformMismatch } from "./mappers/header";
import { readTabularFile, ImportFileError } from "./parsers/file-reader";
import { normalizeImportPhone, parseImportDate, parseImportNumber } from "./utils";
import { hasInconsistentOrderHeader } from "./validators/order-group";

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
  assert(!parsed.columns.includes("Campaign name"), "header asli tidak memenuhi preview baku");
  assert(parsed.columns.at(-2) === "Status Validasi" && parsed.columns.at(-1) === "Catatan Validasi", "validasi berada di akhir preview");

  const shopeeAdsHeaders = [
    "Nama Iklan", "Tanggal Mulai", "Tanggal Selesai", "Dilihat", "Jumlah Klik",
    "Konversi", "Omzet Penjualan", "Biaya",
  ];
  const shopeeAds = mapAdsRows([{
    "Nama Iklan": "Shop GMV Max",
    "Tanggal Mulai": "23/06/2026 00:00:00",
    "Tanggal Selesai": "Tidak Terbatas",
    Dilihat: "4388",
    "Jumlah Klik": "142",
    Konversi: "11",
    "Omzet Penjualan": "4255284",
    Biaya: "278838",
  }], shopeeAdsHeaders, "shopee", "ADV Shopee");
  const shopeeAd = shopeeAds.rows[0]!;
  assert(shopeeAd.status === "valid", "header asli Shopee Ads diterima");
  assert(shopeeAd.display.Campaign === "Shop GMV Max", "nama iklan menjadi campaign Shopee");
  assert(shopeeAd.display["CTR (%)"] === 3.2361, "CTR dihitung dari klik dibagi tayangan");
  assert(shopeeAd.display["Biaya per Pesanan (CPA)"] === 25349, "CPA dihitung dari spending dibagi konversi");
  assert(shopeeAd.display["ROAS Platform"] === 15.2608, "ROAS dihitung dari omzet platform dibagi spending");

  const orderHeaders = ["confirmed_time", "order_id", "name", "phone", "product", "qty", "gross_revenue", "payment_method", "Kolom Asli Tambahan"];
  const order = mapOrderRows([{
    confirmed_time: "2026-07-16",
    order_id: "SCL-001",
    name: "Pelanggan Contoh",
    phone: "081234567890",
    product: "Probetes Herbal",
    qty: "2",
    gross_revenue: "500000",
    payment_method: "COD",
    "Kolom Asli Tambahan": "tetap disimpan",
  }], orderHeaders, "meta", "Akuisisi Scalev");
  assert(order.columns[0] === "Tanggal Pesanan", "tanggal pesanan menjadi kolom pertama");
  assert(order.rows[0]?.display["Metode Bayar"] === "COD", "metode bayar masuk data baku");
  assert(!order.columns.includes("Kolom Asli Tambahan"), "kolom asli tambahan tidak tampil di preview baku");
  assert(order.rows[0]?.raw["Kolom Asli Tambahan"] === "tetap disimpan", "kolom asli tambahan tetap tersedia untuk audit");

  const tiktokHeaders = [
    "Order ID", "Order Status", "Product Name", "Quantity", "SKU Unit Original Price",
    "SKU Subtotal After Discount", "Order Amount", "Created Time", "Tracking ID",
    "Shipping Provider Name", "Recipient", "Phone #", "Province", "Regency and City", "Payment Method",
  ];
  const tiktokOrder = mapOrderRows([{
    "Order ID": "Platform unique order ID.",
    "Order Status": "Current order status.",
    "Product Name": "Platform product name.",
    Quantity: "SKU sold quantity in the order.",
    "Order Amount": "Order total amount paid by the buyer.",
    "Created Time": "Order created time.",
  }, {
    "Order ID": "TK-001",
    "Order Status": "Selesai",
    "Product Name": "Probetes Herbal 24",
    Quantity: "2",
    "SKU Unit Original Price": "120000",
    "SKU Subtotal After Discount": "200000",
    "Order Amount": "211500",
    "Created Time": "30/06/2026 14:50:08",
    "Tracking ID": "RESI-001",
    "Shipping Provider Name": "J&T Express",
    Recipient: "Pelanggan Tersensor",
    "Phone #": "(+62)812******32",
    Province: "DKI Jakarta",
    "Regency and City": "Jakarta Barat",
    "Payment Method": "Transfer bank",
  }], tiktokHeaders, "tiktok", "Probetes");
  assert(tiktokOrder.rows.length === 1, "baris petunjuk TikTok tidak dianggap sebagai order");
  assert(tiktokOrder.rows[0]?.status === "valid", "nomor HP tersensor tetap dapat masuk staging");
  assert(tiktokOrder.rows[0]?.parsed.itemSubtotal === 200000, "subtotal SKU dipisahkan dari total order");
  assert(tiktokOrder.rows[0]?.parsed.total === 211500, "omzet order disimpan satu kali dari Order Amount");

  const shopeeOrderHeaders = [
    "No. Pesanan", "Waktu Pesanan Dibuat", "Nama Penerima", "No. Telepon", "Nama Produk",
    "Jumlah", "Harga Setelah Diskon", "Subtotal Pesanan", "Total Pembayaran", "Metode Pembayaran",
  ];
  const shopeeOrder = mapOrderRows([{
    "No. Pesanan": "SHP-001",
    "Waktu Pesanan Dibuat": "2026-06-27 19:38",
    "Nama Penerima": "Penerima Tersensor",
    "No. Telepon": "******37",
    "Nama Produk": "Probetes Herbal 24",
    Jumlah: "1",
    "Harga Setelah Diskon": "108.699",
    "Subtotal Pesanan": "108.699",
    "Total Pembayaran": "114.599",
    "Metode Pembayaran": "Saldo ShopeePay",
  }], shopeeOrderHeaders, "shopee", "Probetes Herbal");
  assert(shopeeOrder.rows[0]?.status === "valid", "header asli Shopee Order diterima");
  assert(shopeeOrder.rows[0]?.parsed.total === 114599, "Total Pembayaran menjadi omzet order Shopee");

  const scalevHeaders = [
    "order_id", "business_name", "gross_revenue", "confirmed_time", "is_from_form",
    "utm_campaign", "is_purchase_tiktok",
  ];
  assert(detectPlatformMismatch(scalevHeaders, "meta") === null, "Scalev tidak salah dianggap TikTok");
  assert(/Meta/.test(detectPlatformMismatch(scalevHeaders, "tiktok") ?? ""), "fingerprint Scalev dikenali sebagai Meta/Akuisisi");
  assert(!hasInconsistentOrderHeader([
    { invoice: "M-001", total: 250000, customer: "A", itemSubtotal: 100000 },
    { invoice: "M-001", total: 250000, customer: "A", itemSubtotal: 150000 },
  ]), "item berbeda boleh berbagi total order yang sama");
  assert(hasInconsistentOrderHeader([
    { invoice: "M-001", total: 250000, customer: "A" },
    { invoice: "M-001", total: 300000, customer: "A" },
  ]), "total order berbeda dalam satu invoice ditolak");
  assert(hasInconsistentOrderHeader([
    { invoice: "M-001", total: 250000, customer: "A", paymentStatus: "Paid" },
    { invoice: "M-001", total: 250000, customer: "a", paymentStatus: "Unpaid" },
  ]), "status pembayaran berbeda dalam satu invoice ditolak tanpa sensitif kapitalisasi nama");

  let rejected = false;
  try { await readTabularFile(await workbookFile(false), "ads"); }
  catch (error) { rejected = error instanceof ImportFileError && /spending/i.test(error.message) && /TikTok Ads/.test(error.message); }
  assert(rejected, "file tanpa spending ditolak sekali dengan pesan jelas");
  console.log("Marketing import self-check berhasil.");
}

void run();
