import type { DatabaseMenu } from "../types/database.types";

export const databaseMenus = [
  {
    id: "data-overview",
    name: "Ringkasan Data",
    description: "Ringkasan data utama ERP yang tersedia.",
    badge: "Prioritas awal",
    badgeTone: "green",
    href: "/database/overview",
    isActive: true,
  },
  {
    id: "master-data",
    name: "Data Utama",
    description: "Akses pelanggan, cohort, produk, channel, CS, dan ekspedisi.",
    badge: "Aktif",
    badgeTone: "active",
    href: "/database/master-data",
    isActive: true,
  },
  {
    id: "data-quality",
    name: "Kualitas Data",
    description: "Pantau data duplikat, kosong, tidak valid, atau belum rapi.",
    badge: "Aktif",
    badgeTone: "active",
    href: "/database/data-quality",
    isActive: true,
  },
  {
    id: "backup-status",
    name: "Status Cadangan",
    description: "Pantau data acuan, cadangan, dan keamanan data.",
    badge: "Dipantau",
    badgeTone: "monitoring",
    href: "/database/backup-status",
  },
] satisfies DatabaseMenu[];
