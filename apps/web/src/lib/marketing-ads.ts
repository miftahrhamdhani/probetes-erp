import type { AvailabilityMap } from "@/lib/availability";
import { available, notAvailable } from "@/lib/availability";

export interface MetaAdsImportRow {
  campaignName: string;
  reportStartDate: string;
  reportEndDate: string;
  campaignCreatedAt: string | null;
  campaignDeliveryStatus: string | null;
  budgetValue: number | null;
  budgetType: string | null;
  spend: number;
  checkoutStarted: number;
  costPerCheckout: number | null;
  purchases: number;
  costPerPurchase: number | null;
  purchaseValue: number;
  platformRoas: number | null;
  linkClicks: number;
  cpcLink: number | null;
  landingPageViews: number;
  costPerLandingPageView: number | null;
  ctrLink: number | null;
  reach: number;
  impressions: number;
  cpm: number | null;
  frequency: number | null;
  addToCart: number | null;
  leads: number | null;
  costPerLead: number | null;
  video3sViews: number | null;
  thruplays: number | null;
  avgWatchTime: number | null;
  videoPlayed25: number | null;
  videoPlayed50: number | null;
  videoPlayed75: number | null;
  videoPlayed95: number | null;
  rawData: Record<string, string>;
}

export interface ParsedMetaAdsFile {
  rows: MetaAdsImportRow[];
  productLabel: string | null;
  accountCode: string | null;
  advertiserName: string | null;
  reportMonth: string | null;
  fileLabel: string;
  missingRequiredHeaders: string[];
}

export interface AdsFilters {
  startDate: string;
  endDate: string;
  platform: string | null;
  productLabel: string | null;
  advertiserName: string | null;
  accountCode: string | null;
  campaignName: string | null;
  campaignDeliveryStatus: string | null;
}

export const ADS_AVAILABILITY: AvailabilityMap = {
  platform_roas: available("Menggunakan nilai konversi pembelian dari import Meta Ads."),
  erp_roas: notAvailable("Belum ada mapping campaign, UTM, atau click_id ke pesanan ERP."),
  adset_performance: notAvailable("File import belum memuat nama atau ID set iklan."),
  ads_performance: notAvailable("File import belum memuat nama atau ID iklan."),
  attribution: notAvailable("Belum ada mapping data iklan ke pesanan ERP."),
};

const MONTHS: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6, july: 7, august: 8,
  october: 10, december: 12,
};

const COLUMN_ALIASES: Record<string, string> = {
  "nama kampanye": "campaignName",
  "campaign name": "campaignName",
  "awal pelaporan": "reportStartDate",
  "akhir pelaporan": "reportEndDate",
  "tanggal pembuatan": "campaignCreatedAt",
  "penayangan kampanye": "campaignDeliveryStatus",
  "anggaran set iklan": "budgetValue",
  "jenis anggaran set iklan": "budgetType",
  "jumlah yang dibelanjakan (idr)": "spend",
  "total belanja (spend)": "spend",
  "proses pembayaran yang dimulai": "checkoutStarted",
  "initiate checkout (ic)": "checkoutStarted",
  "biaya per memulai checkout (idr)": "costPerCheckout",
  "biaya per ic (idr)": "costPerCheckout",
  "pembelian": "purchases",
  "total pembelian (closing)": "purchases",
  "harga per pembelian (idr)": "costPerPurchase",
  "harga per closing / cpa (idr)": "costPerPurchase",
  "nilai konversi pembelian": "purchaseValue",
  "nilai konversi / omzet (idr)": "purchaseValue",
  "roas (imbal hasil belanja iklan) pembelian": "platformRoas",
  roas: "platformRoas",
  "klik tautan": "linkClicks",
  "klik tautan (link clicks)": "linkClicks",
  "cpc (biaya per klik tautan) (idr)": "cpcLink",
  "cpc (idr)": "cpcLink",
  "tayangan halaman tujuan": "landingPageViews",
  "tayangan halaman (landing page views)": "landingPageViews",
  "biaya per tayangan halaman landas (idr)": "costPerLandingPageView",
  "ctr (rasio klik tayang tautan)": "ctrLink",
  ctr: "ctrLink",
  jangkauan: "reach",
  impresi: "impressions",
  "cpm (biaya per 1.000 tayangan) (idr)": "cpm",
  frekuensi: "frequency",
  "penambahan ke keranjang belanja": "addToCart",
  "prospek penjualan": "leads",
  "biaya per prospek (idr)": "costPerLead",
  "tayangan video 3 detik": "video3sViews",
  thruplays: "thruplays",
  "waktu tonton rata-rata video": "avgWatchTime",
  "video diputar hingga 25%": "videoPlayed25",
  "video diputar hingga 50%": "videoPlayed50",
  "video diputar hingga 75%": "videoPlayed75",
  "video diputar hingga 95%": "videoPlayed95",
};

function normalizeHeader(value: string): string {
  return value.replace(/^﻿/, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

/** CSV parser kecil RFC 4180: mendukung koma, kutip dua, dan newline di dalam nilai. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!;
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value); value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = []; value = "";
    } else value += char;
  }
  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

/** Format Indonesia / internasional / persen / strip menjadi number aman atau null. */
export function parseAdsNumber(value: string | undefined): number | null {
  const raw = value?.trim();
  if (!raw || raw === "-" || raw === "–") return null;
  const cleaned = raw.replace(/\s/g, "").replace(/[Rp%]/gi, "").replace(/[^0-9,.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const normalized = lastComma > lastDot
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFileMetadata(fileName: string) {
  const base = fileName.replace(/\.csv$/i, "").replace(/_rapi$/i, "").trim();
  const parts = base.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  const accountIndex = parts.findIndex((part) => /^\d+$/.test(part));
  const productLabel = accountIndex > 0 ? parts.slice(0, accountIndex).join(" - ") : null;
  const accountCode = accountIndex >= 0 ? parts[accountIndex]! : null;
  const reportMonth = accountIndex >= 0 ? parts[accountIndex + 1] ?? null : null;
  const advertiserPart = accountIndex >= 0 ? parts.slice(accountIndex + 2).join(" - ") : "";
  const advertiserName = advertiserPart.replace(/^adv\s+/i, "").trim() || null;
  return { productLabel, accountCode, reportMonth, advertiserName, fileLabel: base };
}

function monthRange(monthName: string | null, year: number): { start: string; end: string } | null {
  const month = monthName ? MONTHS[monthName.trim().toLowerCase()] : undefined;
  if (!month) return null;
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function normalizeDate(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString().slice(0, 10);
  const m = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
}

export function parseMetaAdsCsv(text: string, fileName: string, reportYear: number): ParsedMetaAdsFile {
  const csvRows = parseCsv(text);
  const metadata = parseFileMetadata(fileName);
  if (!csvRows.length) return { ...metadata, rows: [], missingRequiredHeaders: ["File CSV kosong"] };

  const headers = csvRows[0]!.map(normalizeHeader);
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const required = ["nama kampanye", "jumlah yang dibelanjakan (idr)"];
  const legacyRequired = ["nama kampanye", "total belanja (spend)"];
  const missingRequiredHeaders = (headerIndex.has("jumlah yang dibelanjakan (idr)") ? required : legacyRequired)
    .filter((header) => !headerIndex.has(header));
  const fallbackRange = monthRange(metadata.reportMonth, reportYear);

  const rows = csvRows.slice(1).flatMap((cells) => {
    const rawData = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const value = (header: string) => cells[headerIndex.get(header) ?? -1];
    const campaignName = (value("nama kampanye") ?? value("campaign name") ?? "").trim();
    if (!campaignName) return [];

    const reportStartDate = normalizeDate(value("awal pelaporan")) ?? fallbackRange?.start;
    const reportEndDate = normalizeDate(value("akhir pelaporan")) ?? fallbackRange?.end;
    if (!reportStartDate || !reportEndDate) return [];

    const field = (key: keyof typeof COLUMN_ALIASES) => {
      const index = headerIndex.get(key);
      return index === undefined ? undefined : cells[index];
    };
    const numeric = (key: keyof typeof COLUMN_ALIASES) => parseAdsNumber(field(key));
    const textField = (key: keyof typeof COLUMN_ALIASES) => field(key)?.trim() || null;

    return [{
      campaignName, reportStartDate, reportEndDate,
      campaignCreatedAt: normalizeDate(field("tanggal pembuatan")),
      campaignDeliveryStatus: textField("penayangan kampanye"),
      budgetValue: numeric("anggaran set iklan"), budgetType: textField("jenis anggaran set iklan"),
      spend: numeric(headerIndex.has("jumlah yang dibelanjakan (idr)") ? "jumlah yang dibelanjakan (idr)" : "total belanja (spend)") ?? 0,
      checkoutStarted: numeric(headerIndex.has("proses pembayaran yang dimulai") ? "proses pembayaran yang dimulai" : "initiate checkout (ic)") ?? 0,
      costPerCheckout: numeric(headerIndex.has("biaya per memulai checkout (idr)") ? "biaya per memulai checkout (idr)" : "biaya per ic (idr)"),
      purchases: numeric(headerIndex.has("pembelian") ? "pembelian" : "total pembelian (closing)") ?? 0,
      costPerPurchase: numeric(headerIndex.has("harga per pembelian (idr)") ? "harga per pembelian (idr)" : "harga per closing / cpa (idr)"),
      purchaseValue: numeric(headerIndex.has("nilai konversi pembelian") ? "nilai konversi pembelian" : "nilai konversi / omzet (idr)") ?? 0,
      platformRoas: numeric(headerIndex.has("roas (imbal hasil belanja iklan) pembelian") ? "roas (imbal hasil belanja iklan) pembelian" : "roas"),
      linkClicks: numeric(headerIndex.has("klik tautan") ? "klik tautan" : "klik tautan (link clicks)") ?? 0,
      cpcLink: numeric(headerIndex.has("cpc (biaya per klik tautan) (idr)") ? "cpc (biaya per klik tautan) (idr)" : "cpc (idr)"),
      landingPageViews: numeric(headerIndex.has("tayangan halaman tujuan") ? "tayangan halaman tujuan" : "tayangan halaman (landing page views)") ?? 0,
      costPerLandingPageView: numeric("biaya per tayangan halaman landas (idr)"), ctrLink: numeric(headerIndex.has("ctr (rasio klik tayang tautan)") ? "ctr (rasio klik tayang tautan)" : "ctr"),
      reach: numeric("jangkauan") ?? 0, impressions: numeric("impresi") ?? 0, cpm: numeric("cpm (biaya per 1.000 tayangan) (idr)"), frequency: numeric("frekuensi"),
      addToCart: numeric("penambahan ke keranjang belanja"), leads: numeric("prospek penjualan"), costPerLead: numeric("biaya per prospek (idr)"),
      video3sViews: numeric("tayangan video 3 detik"), thruplays: numeric("thruplays"), avgWatchTime: numeric("waktu tonton rata-rata video"),
      videoPlayed25: numeric("video diputar hingga 25%"), videoPlayed50: numeric("video diputar hingga 50%"), videoPlayed75: numeric("video diputar hingga 75%"), videoPlayed95: numeric("video diputar hingga 95%"),
      rawData,
    }];
  });

  return { ...metadata, rows, missingRequiredHeaders };
}

export function buildAdsFilters(params: URLSearchParams): AdsFilters {
  const value = (name: string) => params.get(name)?.trim() || null;
  return {
    startDate: value("start_date") ?? "1900-01-01",
    endDate: value("end_date") ?? "2999-12-31",
    platform: value("platform"), productLabel: value("product_label"), advertiserName: value("advertiser_name"),
    accountCode: value("account_code"), campaignName: value("campaign_name"), campaignDeliveryStatus: value("campaign_delivery_status"),
  };
}

export function adsWhere(filters: AdsFilters) {
  const clauses = ["m.report_start_date <= $2", "m.report_end_date >= $1"];
  const params: unknown[] = [filters.startDate, filters.endDate];
  const pairs: Array<[string, string | null]> = [
    ["m.platform", filters.platform], ["m.product_label", filters.productLabel], ["m.advertiser_name", filters.advertiserName],
    ["m.account_code", filters.accountCode], ["m.campaign_name", filters.campaignName], ["m.campaign_delivery_status", filters.campaignDeliveryStatus],
  ];
  for (const [column, value] of pairs) {
    if (value) { clauses.push(`${column} = $${params.length + 1}`); params.push(value); }
  }
  return { where: clauses.join(" AND "), params };
}
