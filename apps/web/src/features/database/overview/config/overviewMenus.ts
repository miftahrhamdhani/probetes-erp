import type { OverviewMenu } from "../types/databaseOverview.types";

export const overviewMenus = [
  { id: "available-data-summary", title: "Ringkasan Data Tersedia", badge: "Aktif", icon: "bar-chart" },
  { id: "order-sales-comparison", title: "Perbandingan Data Pesanan dan Penjualan", badge: "2.962", icon: "shopping-cart" },
  { id: "main-data-readiness", title: "Kesiapan Data Utama", badge: "85%", icon: "database" },
  { id: "product-name-review", title: "Nama Produk yang Perlu Dirapikan", badge: "41", icon: "tag" },
  { id: "initial-data-quality", title: "Kualitas Data Awal", badge: "78%", icon: "shield" },
  { id: "data-security-backup", title: "Keamanan dan Cadangan Data", badge: "Terjamin", icon: "lock" },
] satisfies OverviewMenu[];
