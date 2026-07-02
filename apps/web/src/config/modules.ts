import type { ErpModuleItem } from "@probetes/types";

export const erpModules = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Sales, ME, HPP, GPM, leads, campaign.",
    badge: "Fase 1 aktif",
    badgeTone: "green",
    isActive: true
  },
  {
    id: "reports",
    name: "Reports",
    description: "Ringkasan output dan laporan performa.",
    badge: "Marketing report",
    badgeTone: "blue"
  },
  {
    id: "finance",
    name: "Finance",
    description: "Rekonsiliasi, pembayaran, margin.",
    badge: "Next soon",
    badgeTone: "neutral"
  },
  {
    id: "gudang",
    name: "Gudang",
    description: "Stok, keluar masuk barang, fulfillment.",
    badge: "Next soon",
    badgeTone: "neutral"
  },
  {
    id: "database",
    name: "Database",
    description: "Migrasi data, staging, mapping, validasi.",
    badge: "Prioritas awal",
    badgeTone: "green",
    isActive: true
  },
  {
    id: "produksi",
    name: "Produksi",
    description: "Batch produk, HPP, kebutuhan bahan.",
    badge: "Next soon",
    badgeTone: "neutral"
  },
  {
    id: "user-management",
    name: "User Management",
    description: "Role, akses, tim, audit aktivitas.",
    badge: "Next soon",
    badgeTone: "neutral"
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description: "Bantu baca data dan rangkum insight.",
    badge: "Next soon",
    badgeTone: "neutral"
  },
  {
    id: "setting",
    name: "Setting",
    description: "Konfigurasi sistem dan integrasi.",
    badge: "Next soon",
    badgeTone: "neutral"
  }
] satisfies ErpModuleItem[];
