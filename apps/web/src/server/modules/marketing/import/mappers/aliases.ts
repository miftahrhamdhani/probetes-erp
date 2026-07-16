// Kamus alias kolom lintas platform (TikTok, Shopee, Meta/Scalev). Tambah alias
// baru cukup di sini tanpa mengubah logika mapping/validasi.

export const ADS_ALIASES = {
  reportDate: [
    "tanggal", "date", "day", "by day", "waktu", "tanggal mulai", "waktu mulai",
    "start date", "awal pelaporan", "reporting starts", "report start date",
  ],
  reportEndDate: ["tanggal selesai", "waktu selesai", "end date", "akhir pelaporan", "report end date"],
  campaign: ["campaign", "campaign name", "nama campaign", "nama kampanye", "campaign title"],
  adset: ["adset", "ad set", "nama adset", "ad group", "ad group name", "grup iklan", "nama grup iklan"],
  adName: ["ad name", "nama iklan", "iklan", "product ads", "nama iklan produk", "judul video"],
  adId: ["ad id", "id iklan", "video id", "id video"],
  creativePublishedAt: ["waktu posting", "post time", "video post time", "tanggal posting"],
  campaignId: ["campaign id", "id campaign", "id kampanye"],
  productId: ["product id", "id product", "id produk", "item id"],
  spend: [
    "spending", "spend", "biaya", "dibelanjakan", "amount spent",
    "amount spent idr", "jumlah yang dibelanjakan", "jumlah yang dibelanjakan idr",
    "total belanja spend", "pengeluaran",
  ],
  impressions: ["impression", "impressions", "impresi", "tayangan", "impresi iklan produk"],
  clicks: ["click", "clicks", "klik", "klik tautan", "link clicks", "jumlah klik iklan produk"],
  leads: ["lead", "leads", "result", "results", "hasil", "konversi", "conversion", "pembelian", "pesanan sku"],
  purchaseValue: ["nilai konversi pembelian", "purchase value", "conversion value", "omzet penjualan", "pendapatan kotor"],
  status: ["status", "delivery status", "penayangan kampanye", "status iklan"],
} as const;

export const ORDER_ALIASES = {
  orderDate: [
    "tanggal pesanan", "tanggal", "date", "waktu", "waktu pesanan", "order date",
    "created at", "paid time", "completed time", "confirmed time", "draft time",
  ],
  invoice: ["invoice", "no invoice", "nomor invoice", "id pesanan", "no pesanan", "no pesanan toko", "order id", "order number"],
  trackingNumber: ["no resi", "nomor resi", "resi", "tracking number", "shipment receipt"],
  customer: ["customer", "nama customer", "nama pembeli", "buyer name", "recipient name", "name", "nama"],
  phone: ["no hp", "nomor hp", "phone", "phone number", "telepon", "whatsapp", "no whatsapp", "nomor telepon"],
  email: ["email", "email pembeli", "buyer email"],
  product: ["produk", "nama produk", "product", "product name", "nama barang", "item name", "store"],
  qty: ["qty", "quantity", "jumlah", "jumlah produk", "product quantity", "kuantitas"],
  unitPrice: ["harga produk", "harga", "product price", "unit price", "harga satuan"],
  total: ["total bayar", "total", "total amount", "nilai produk", "net revenue", "gross revenue", "total pembayaran"],
  orderStatus: ["status pesanan", "order status", "status", "status order"],
  customerType: ["tipe pelanggan", "customer type", "customer type new repeat"],
  paymentMethod: ["metode bayar", "payment method", "metode pembayaran"],
} as const;
