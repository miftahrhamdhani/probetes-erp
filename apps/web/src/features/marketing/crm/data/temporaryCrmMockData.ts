import type { CrmAdsRow, CrmCenterData, CrmCluster, CrmCustomerDetail, CrmCustomerRow, CrmReviewRow } from "../types/crmTypes";

// TODO: Ganti temporary mock data ini ke database asli/API backend setelah backend CRM tersedia.
export const CRM_DATA_TERKINI = "13 Juli 2026";

export const CRM_CENTER_MOCK: CrmCenterData = {
  dataTerkini: CRM_DATA_TERKINI,
  heroStats: [
    { label: "Total Customer", value: "8.420" }, { label: "Perlu Follow-up", value: "1.184" },
    { label: "Sudah Masuk Grup", value: "5.906" }, { label: "Cluster Status", value: "14 Aktif" },
  ],
  menuCards: [
    { id: "import", href: "/marketing/crm/import", title: "Import CRM", description: "Upload manual CSV/Excel, preview, validasi, dan simpan data.", badge: "Manual", icon: "upload", stats: [{ label: "File Hari Ini", value: "3" }, { label: "Perlu Review", value: "27" }] },
    { id: "orders", href: "/marketing/crm/orders", title: "Data Pesanan", description: "Pantau closingan, customer, produk, dan status follow-up.", badge: "Active", icon: "receipt", stats: [{ label: "Total Closing", value: "612" }, { label: "Repeat Rate", value: "34,2%" }] },
    { id: "ads", href: "/marketing/crm/ads", title: "Data Iklan CRM", description: "Lihat spending, leads, closing, dan campaign CRM.", badge: "Active", icon: "megaphone", stats: [{ label: "Spending", value: "Rp84,5 jt" }, { label: "ROAS CRM", value: "3,1x" }] },
    { id: "rfm-cohort", href: "/marketing/crm/rfm-cohort", title: "RFM & Cohort", description: "Retention, frequency, cluster, dan detail customer.", badge: "Prioritas", icon: "layers", stats: [{ label: "Total Customer", value: "8.420" }, { label: "Cluster", value: "14" }] },
    { id: "review", href: "/marketing/crm/review", title: "Data Review", description: "Cek data kosong, duplikat, dan issue CRM yang perlu ditindak.", badge: "Monitoring", icon: "clipboard-check", stats: [{ label: "Total Issue", value: "146" }, { label: "Prioritas Tinggi", value: "38" }] },
  ],
};

export const CRM_CUSTOMERS: CrmCustomerRow[] = [
  { id: "CRM-001", tanggal: "2026-07-12", nama: "Siti Rahma", noWa: "081234567890", produk: "Probetes Herbal", qty: 2, totalBayar: 580000, cs: "Rista", channel: "CRM", statusGrup: "Sudah Masuk", cluster: "A1", followUp: "Upsell paket 30 hari", status: "Selesai", cohort: "Jan 2026", frequency: 4 },
  { id: "CRM-002", tanggal: "2026-07-12", nama: "Budi Santoso", noWa: "085712312312", produk: "Ebook 145", qty: 1, totalBayar: 145000, cs: "Nadia", channel: "Akuisisi / Meta", statusGrup: "Belum Masuk", cluster: "D-New", followUp: "Undang grup hari ini", status: "Selesai", cohort: "Jul 2026", frequency: 1 },
  { id: "CRM-003", tanggal: "2026-07-11", nama: "Dewi Lestari", noWa: "082145678901", produk: "Amandia", qty: 1, totalBayar: 325000, cs: "Rista", channel: "WhatsApp", statusGrup: "Sudah Masuk", cluster: "C-HP", followUp: "Cek konsumsi", status: "Diproses", cohort: "Nov 2025", frequency: 1 },
  { id: "CRM-004", tanggal: "2026-07-11", nama: "Andi Pratama", noWa: "081356789012", produk: "Ebook Remisi", qty: 2, totalBayar: 290000, cs: "Dimas", channel: "CRM", statusGrup: "Sudah Masuk", cluster: "C-F2", followUp: "Tawarkan produk fisik", status: "Selesai", cohort: "Feb 2026", frequency: 2 },
  { id: "CRM-005", tanggal: "2026-07-10", nama: "Nur Aini", noWa: "087812345678", produk: "Probetes Herbal", qty: 3, totalBayar: 870000, cs: "Nadia", channel: "Akuisisi / Meta", statusGrup: "Belum Masuk", cluster: "Dhp-Old", followUp: "Follow-up urgent", status: "Selesai", cohort: "Jun 2026", frequency: 1 },
  { id: "CRM-006", tanggal: "2026-07-10", nama: "Rina Kurnia", noWa: "089612345678", produk: "Probetes Herbal", qty: 1, totalBayar: 290000, cs: "Rista", channel: "Marketplace", statusGrup: "Sudah Masuk", cluster: "A3", followUp: "Jaga repeat", status: "Selesai", cohort: "Sep 2025", frequency: 3 },
];

export const CRM_ADS: CrmAdsRow[] = [
  { id: "ADS-01", tanggal: "2026-07-12", platform: "Meta", adv: "Irfan", campaign: "CRM Ebook Retargeting", spending: 8200000, leads: 392, closing: 84, sales: 23100000, costPerClosing: 97619, roas: 2.82, status: "Bagus" },
  { id: "ADS-02", tanggal: "2026-07-12", platform: "Meta", adv: "Zidny", campaign: "HP Lead Juli", spending: 11300000, leads: 510, closing: 96, sales: 27840000, costPerClosing: 117708, roas: 2.46, status: "Cek" },
  { id: "ADS-03", tanggal: "2026-07-11", platform: "TikTok", adv: "Bagas", campaign: "Grup WA Probetes", spending: 6100000, leads: 270, closing: 38, sales: 11020000, costPerClosing: 160526, roas: 1.81, status: "Evaluasi" },
  { id: "ADS-04", tanggal: "2026-07-11", platform: "Meta", adv: "Irfan", campaign: "Amandia Repeat", spending: 4900000, leads: 230, closing: 0, sales: 0, costPerClosing: 0, roas: 0, status: "Pause" },
];

export const CRM_CLUSTERS: CrmCluster[] = [
  ["A1", "Maintain dan upsell"], ["A2", "Dorong pembelian ketiga"], ["A3", "Jaga repeat"], ["A4", "Jaga relasi"], ["B", "Pisahkan database Yacona"], ["C-Prodig", "Dorong produk fisik"], ["C-HP", "Follow-up konsumsi"], ["C-F2", "Dorong produk fisik"], ["D-New", "Prioritas invite grup"], ["D-Old", "Follow-up urgent"], ["Dhp-New", "Invite grup bulan ini"], ["Dhp-Old", "Follow-up urgent"], ["E", "Reaktivasi customer lama"], ["F", "Review kategori umum"],
].map(([key, action], index) => ({ key: key!, label: key!, action: action!, count: 180 + index * 37, revenue: 12000000 + index * 3500000, color: ["#E30613", "#2563EB", "#7C3AED", "#F59E0B", "#059669"][index % 5]! }));

export const CRM_REVIEWS: CrmReviewRow[] = [
  { id: "REV-01", tipeData: "Customer", customer: "Budi Santoso", noWa: "-", masalah: "No WA kosong", dampak: "Tidak bisa follow-up", prioritas: "Tinggi", rekomendasi: "Lengkapi dari sumber closing", status: "Belum Diperbaiki", customerId: "CRM-002" },
  { id: "REV-02", tipeData: "Pesanan", customer: "Dewi Lestari", noWa: "082145678901", masalah: "CS/CRM kosong", dampak: "Owner customer tidak jelas", prioritas: "Sedang", rekomendasi: "Konfirmasi tim CRM", status: "Belum Diperbaiki", customerId: "CRM-003" },
  { id: "REV-03", tipeData: "Produk", customer: "Andi Pratama", noWa: "081356789012", masalah: "Produk belum mapping", dampak: "Cluster tidak akurat", prioritas: "Sedang", rekomendasi: "Rapikan nama produk", status: "Sudah Diperbaiki", customerId: "CRM-004" },
  { id: "REV-04", tipeData: "Customer", customer: "Nur Aini", noWa: "087812345678", masalah: "Status grup belum jelas", dampak: "Invite grup tertunda", prioritas: "Tinggi", rekomendasi: "Cek riwayat grup", status: "Belum Diperbaiki", customerId: "CRM-005" },
  { id: "REV-05", tipeData: "Cohort", customer: "Rina Kurnia", noWa: "089612345678", masalah: "Yacona tercampur cohort utama", dampak: "Retention bias", prioritas: "Rendah", rekomendasi: "Pisahkan kategori Yacona", status: "Belum Diperbaiki", customerId: "CRM-006" },
];

export const CRM_DETAILS: CrmCustomerDetail[] = CRM_CUSTOMERS.map((row) => ({
  ...row, alamat: "Jl. Melati No. 12", kota: "Makassar", beliPertama: "2026-01-14", beliTerakhir: row.tanggal, totalFisik: Math.round(row.totalBayar * 0.75), totalDigital: Math.round(row.totalBayar * 0.25), produkPertama: "Ebook 145", produkTerakhir: row.produk, namaGrup: row.statusGrup === "Sudah Masuk" ? "Grup Probetes Sehat" : "-", catatan: row.followUp,
  riwayatTransaksi: [{ tanggal: row.tanggal, produk: row.produk, total: row.totalBayar }, { tanggal: "2026-05-18", produk: "Ebook 145", total: 145000 }],
  riwayatFollowUp: [{ tanggal: "2026-07-12", catatan: row.followUp, cs: row.cs }],
}));
