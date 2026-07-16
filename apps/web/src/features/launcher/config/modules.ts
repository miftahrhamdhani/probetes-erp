import type { LauncherModule } from "../types/launcher.types";

export const erpModules = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Sales, ME, HPP, GPM, leads, campaign.",
    badge: "Fase 1 aktif",
    badgeTone: "green",
    href: "/marketing",
    isActive: true
  },
  {
    id: "reports",
    name: "Reports",
    description: "Ringkasan output dan laporan performa.",
    badge: "Marketing report",
    badgeTone: "blue",
    href: "/reports"
  },
  {
    id: "finance",
    name: "Finance",
    description: "Rekonsiliasi, pembayaran, margin.",
    badge: "Next soon",
    badgeTone: "neutral",
    href: "/finance"
  },
  {
    id: "gudang",
    name: "Warehouse / Gudang",
    description: "Stok, keluar masuk barang, mutasi, dan stock opname.",
    badge: "Bertahap",
    badgeTone: "neutral",
    href: "/warehouse"
  },
  {
    id: "database",
    name: "Database",
    description: "Migrasi data, staging, mapping, validasi.",
    badge: "Prioritas awal",
    badgeTone: "green",
    href: "/database",
    isActive: true
  },
  {
    id: "data-tracking",
    name: "Data Tracking",
    description: "Resi, status kirim, retur, dan pengiriman.",
    badge: "Next soon",
    badgeTone: "neutral",
    href: "/data-tracking"
  },
  {
    id: "hris",
    name: "HRIS",
    description: "Kelola data karyawan, absensi, cuti, payroll, komisi CS/CRM/ADV, dan laporan HRD.",
    badge: "Bertahap",
    badgeTone: "neutral",
    href: "/hris"
  },
  {
    id: "user-management",
    name: "User Management",
    description: "Role, akses, tim, audit aktivitas.",
    badge: "Next soon",
    badgeTone: "neutral",
    href: "/user-management"
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description: "Bantu baca data dan rangkum insight.",
    badge: "Next soon",
    badgeTone: "neutral",
    href: "/ai-assistant"
  },
  {
    id: "setting",
    name: "Setting",
    description: "Konfigurasi sistem dan integrasi.",
    badge: "Next soon",
    badgeTone: "neutral",
    href: "/setting"
  }
] satisfies LauncherModule[];
