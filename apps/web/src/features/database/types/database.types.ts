/** Kartu angka ringkas (dipakai lintas halaman Database). */
export interface KpiItem {
  label: string;
  value: string;
  detail: string;
  tone?: "red" | "green" | "blue" | "amber" | "slate";
}

/** Warna badge status (dipakai lintas halaman Database). */
export type StatusTone = "green" | "blue" | "amber" | "red" | "slate" | "purple";

export interface DatabaseMenu {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeTone: "green" | "blue" | "neutral" | "active" | "monitoring";
  href: string;
  isActive?: boolean;
}
