// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend AI Assistant tersedia.
// Struktur mengikuti rencana schema ai.conversations/messages/saved_insights (read-only atas
// reports.* dan analytics.*), lihat docs/PRD.md bagian 5.12 dan docs/ARSITEKTUR_DATABASE.md.

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type InsightStatus = "Siap Dilihat" | "Perlu Ditindaklanjuti" | "Draft";
export type RiskLevel = "Rendah" | "Sedang" | "Tinggi";

// --- Tanya Data (chat preview) -------------------------------------------------
export interface SampleQuestion {
  pertanyaan: string;
  sumberData: string;
}
const sampleQuestions: SampleQuestion[] = [
  { pertanyaan: "Berapa total sales bulan ini dibanding bulan lalu?", sumberData: "reports.sales_monthly" },
  { pertanyaan: "Customer mana saja yang berisiko hilang (belum beli lagi)?", sumberData: "master.customer_cohorts" },
  { pertanyaan: "Produk apa yang stoknya perlu di-restock minggu ini?", sumberData: "warehouse.stock" },
  { pertanyaan: "Berapa COD yang belum cair dari ekspedisi J&T?", sumberData: "tracking.cod_payments" },
];

// --- Ringkasan Otomatis --------------------------------------------------------
export interface AutoSummaryRow {
  tanggal: string;
  modul: string;
  ringkasan: string;
  status: InsightStatus;
}
const autoSummaries: AutoSummaryRow[] = [
  { tanggal: "2026-07-10", modul: "Sales", ringkasan: "Sales harian naik 8% dibanding kemarin, didorong TikTok Shop.", status: "Siap Dilihat" },
  { tanggal: "2026-07-10", modul: "Tracking", ringkasan: "24 paket retur minggu ini, mayoritas alamat tidak lengkap.", status: "Perlu Ditindaklanjuti" },
  { tanggal: "2026-07-09", modul: "Finance", ringkasan: "COD belum cair meningkat Rp4,2 Jt dibanding minggu lalu.", status: "Perlu Ditindaklanjuti" },
  { tanggal: "2026-07-08", modul: "HRIS", ringkasan: "Kehadiran tim 94% bulan ini, 3 karyawan mengajukan cuti.", status: "Draft" },
];

// --- Insight & Anomali ----------------------------------------------------------
export interface AnomalyRow {
  tanggal: string;
  modul: string;
  insight: string;
  tingkatRisiko: RiskLevel;
  rekomendasi: string;
}
const anomalies: AnomalyRow[] = [
  { tanggal: "2026-07-10", modul: "Marketing", insight: "Spending Meta Ads naik 20% tapi sales stagnan.", tingkatRisiko: "Sedang", rekomendasi: "Evaluasi campaign Akuisisi Juli" },
  { tanggal: "2026-07-09", modul: "Tracking", insight: "Retur ekspedisi SiCepat naik 3x dari rata-rata.", tingkatRisiko: "Tinggi", rekomendasi: "Cek kualitas layanan SiCepat area terkait" },
  { tanggal: "2026-07-08", modul: "Finance", insight: "Selisih settlement TikTok Shop belum direkonsiliasi.", tingkatRisiko: "Sedang", rekomendasi: "Follow-up rekonsiliasi ke tim Finance" },
  { tanggal: "2026-07-07", modul: "CRM", insight: "128 customer repeat belum di-follow-up minggu ini.", tingkatRisiko: "Rendah", rekomendasi: "Masukkan ke daftar follow-up CRM" },
];

// --- Riwayat Percakapan --------------------------------------------------------
export interface ConversationRow {
  tanggal: string;
  user: string;
  pertanyaan: string;
  sumberData: string;
  status: "Terjawab" | "Perlu Data Tambahan";
}
const conversations: ConversationRow[] = [
  { tanggal: "2026-07-10", user: "Owner Probetes", pertanyaan: "Sales TikTok minggu ini gimana?", sumberData: "reports.sales_monthly", status: "Terjawab" },
  { tanggal: "2026-07-09", user: "Rina Marlina", pertanyaan: "Ada berapa COD yang belum cair?", sumberData: "tracking.cod_payments", status: "Terjawab" },
  { tanggal: "2026-07-08", user: "Owner Probetes", pertanyaan: "Margin bulan ini berapa persen?", sumberData: "finance.order_finance", status: "Perlu Data Tambahan" },
];

// --- Insight Tersimpan --------------------------------------------------------
export interface SavedInsightRow {
  tanggal: string;
  judulInsight: string;
  modul: string;
  disimpanOleh: string;
  status: InsightStatus;
}
const savedInsights: SavedInsightRow[] = [
  { tanggal: "2026-07-10", judulInsight: "Sales TikTok naik dibanding minggu lalu", modul: "Marketing", disimpanOleh: "Owner Probetes", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", judulInsight: "Stok Gudang Jakarta perlu dipantau", modul: "Warehouse", disimpanOleh: "Budi Setiawan", status: "Perlu Ditindaklanjuti" },
  { tanggal: "2026-07-08", judulInsight: "Customer repeat perlu follow-up CRM", modul: "CRM", disimpanOleh: "Fajar Nugroho", status: "Draft" },
];

export function getAiAssistantPreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Insight Tersimpan", value: "18", detail: "Sepanjang bulan", tone: "slate" },
    { label: "Laporan Bisa Dibuka", value: "7", detail: "Lintas modul", tone: "blue" },
    { label: "Anomali Terdeteksi", value: "2", detail: "Perlu ditindaklanjuti", tone: "amber" },
    { label: "Rencana Strategi Draft", value: "1", detail: "Belum final", tone: "purple" },
    { label: "Ringkasan Terbaru", value: "Hari ini", detail: "10 Jul 2026", tone: "green" },
  ];

  return { kpi, sampleQuestions, autoSummaries, anomalies, conversations, savedInsights };
}
