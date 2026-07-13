export interface DateRangeValue {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type DateRangePresetKey =
  | "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

export interface DateRangePreset {
  key: DateRangePresetKey;
  label: string;
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { key: "today", label: "Hari ini" },
  { key: "yesterday", label: "Kemarin" },
  { key: "last7", label: "7 hari terakhir" },
  { key: "last30", label: "30 hari terakhir" },
  { key: "thisMonth", label: "Bulan ini" },
  { key: "lastMonth", label: "Bulan lalu" },
  { key: "thisYear", label: "Tahun ini" },
  { key: "custom", label: "Custom Range" },
];
