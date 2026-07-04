import type { DatabaseMenu } from "../types/database.types";

export const databaseMenus = [
  {
    id: "data-overview",
    name: "Data Overview",
    description: "Ringkasan data utama ERP yang tersedia.",
    badge: "Prioritas awal",
    badgeTone: "green",
    href: "/database/overview",
    isActive: true,
  },
  {
    id: "master-data",
    name: "Master Data",
    description: "Akses data customer, produk, order, dan transaksi.",
    badge: "Active",
    badgeTone: "active",
    href: "/database/master-data",
    isActive: true,
  },
  {
    id: "data-quality",
    name: "Data Quality",
    description: "Pantau data duplikat, kosong, tidak valid, atau belum termapping.",
    badge: "Active",
    badgeTone: "active",
    href: "/database/data-quality",
    isActive: true,
  },
  {
    id: "backup-status",
    name: "Backup Status",
    description: "Pantau status backup, restore point, dan keamanan data.",
    badge: "Monitoring",
    badgeTone: "monitoring",
    href: "/database/backup-status",
  },
] satisfies DatabaseMenu[];
