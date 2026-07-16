import type { ImportPlatform, ImportValidationStatus, ParsedImportFile, ParsedImportRow } from "../import.types";
import { parseCampaignTimestamp, parseImportDate, parseImportMonth, parseImportNumber, PLATFORM_LABEL } from "../utils";
import { escalateStatus, finalizeFile } from "../validators/row-status";
import { ADS_ALIASES } from "./aliases";
import { buildHeaderLookup, detectPlatformMismatch, field, findHeader } from "./header";
import { deriveAdsMetrics } from "../normalizers/ads-metrics";

/** Mapping + validasi baris Spending Ads ke bentuk ParsedImportFile. */
export function mapAdsRows(
  rows: Record<string, string>[],
  headers: string[],
  platform: ImportPlatform,
  advName: string,
  periodLabel = "",
): ParsedImportFile {
  const lookup = buildHeaderLookup(headers);
  const mappedHeaders = Object.fromEntries(
    Object.entries(ADS_ALIASES).map(([key, aliases]) => [key, findHeader(lookup, aliases)]),
  ) as Record<keyof typeof ADS_ALIASES, string | null>;
  const fileErrors: string[] = [];
  const reportMonth = platform === "tiktok" ? parseImportMonth(periodLabel) : null;
  const missing = [
    [mappedHeaders.reportDate || reportMonth, "tanggal/periode laporan"],
    [mappedHeaders.campaign, "campaign"],
    [mappedHeaders.spend, "spending"],
  ].filter(([header]) => !header).map(([, label]) => label as string);
  if (missing.length) fileErrors.push(`Kolom wajib tidak ditemukan: ${missing.join(", ")}. Isi periode seperti Juni 2026 jika file TikTok tidak memiliki tanggal laporan.`);
  const mismatch = detectPlatformMismatch(headers, platform);
  if (mismatch) fileErrors.push(mismatch);

  const seen = new Set<string>();
  const parsedRows: ParsedImportRow[] = rows.map((raw, index) => {
    let status: ImportValidationStatus = "valid";
    const notes = [...fileErrors];
    if (fileErrors.length) status = "error";
    const reportDateRaw = field(raw, mappedHeaders.reportDate);
    const fileReportDate = parseImportDate(reportDateRaw);
    const reportEndDateRaw = field(raw, mappedHeaders.reportEndDate);
    const isOpenEnded = /^(?:tidak terbatas|ongoing|no end date)$/i.test(reportEndDateRaw);
    const fileReportEndDate = reportEndDateRaw && !isOpenEnded ? parseImportDate(reportEndDateRaw) : fileReportDate;
    const usesMonthlyFallback = !mappedHeaders.reportDate && Boolean(reportMonth);
    const reportDate = fileReportDate ?? (usesMonthlyFallback ? reportMonth!.start : null);
    const reportEndDate = fileReportEndDate ?? (usesMonthlyFallback ? reportMonth!.end : reportDate);
    const campaign = field(raw, mappedHeaders.campaign);
    const spendRaw = field(raw, mappedHeaders.spend);
    const spend = parseImportNumber(spendRaw);

    if (!reportDateRaw && !usesMonthlyFallback) {
      status = escalateStatus(status, "review");
      notes.push("Tanggal/periode laporan belum diisi.");
    } else if (reportDateRaw && !fileReportDate) {
      status = escalateStatus(status, "error");
      notes.push("Format tanggal tidak valid.");
    } else if (usesMonthlyFallback) {
      notes.push(`Tanggal laporan memakai periode ${reportMonth!.label}; data diperlakukan sebagai agregat bulanan.`);
    }
    if (reportEndDateRaw && !isOpenEnded && !reportEndDate) {
      status = escalateStatus(status, "error");
      notes.push("Format tanggal akhir tidak valid.");
    }
    if (!campaign) {
      status = escalateStatus(status, "review");
      notes.push("Nama campaign belum diisi.");
    }
    if (!spendRaw) {
      status = escalateStatus(status, "review");
      notes.push("Spending belum diisi.");
    } else if (spend === null || spend < 0) {
      status = escalateStatus(status, "error");
      notes.push("Nilai spending tidak valid.");
    }

    const number = (header: string | null) => {
      const rawValue = field(raw, header);
      if (!rawValue) return null;
      const value = parseImportNumber(rawValue);
      if (value === null || value < 0) {
        status = escalateStatus(status, "error");
        notes.push(`Nilai ${header ?? "angka"} tidak valid.`);
      }
      return value;
    };
    const adset = field(raw, mappedHeaders.adset);
    const adName = field(raw, mappedHeaders.adName);
    const adId = field(raw, mappedHeaders.adId);
    const creativePublishedAt = field(raw, mappedHeaders.creativePublishedAt);
    const campaignCreatedAt = parseCampaignTimestamp(campaign);
    const campaignId = field(raw, mappedHeaders.campaignId);
    const productId = field(raw, mappedHeaders.productId);
    const impressions = number(mappedHeaders.impressions);
    const clicks = number(mappedHeaders.clicks);
    const leads = number(mappedHeaders.leads);
    const purchaseValue = number(mappedHeaders.purchaseValue);
    const { ctr, costPerOrder, platformRoas } = deriveAdsMetrics({
      clicks,
      conversions: leads,
      impressions,
      purchaseValue,
      spend,
    });
    const deliveryStatus = field(raw, mappedHeaders.status);
    const duplicateIdentity = usesMonthlyFallback ? adId : adId || adName || campaign;
    const duplicateKey = reportDate && duplicateIdentity
      ? [platform, advName, reportDate, reportEndDate ?? reportDate, duplicateIdentity].map((part) => part.toLocaleLowerCase("id-ID").trim()).join("|")
      : null;
    if (usesMonthlyFallback && !adId) {
      status = escalateStatus(status, "review");
      notes.push("ID video belum tersedia; data bulanan perlu dicek agar tidak terhitung ganda.");
    }
    if (duplicateKey && seen.has(duplicateKey) && status !== "error") {
      status = "duplicate";
      notes.push("Baris duplikat ditemukan di file yang sama.");
    }
    if (duplicateKey) seen.add(duplicateKey);

    const display = {
      Tanggal: reportDate ?? (reportDateRaw || "-"),
      "Tanggal Akhir": reportEndDate ?? (reportEndDateRaw || reportDate || "-"),
      "Cakupan Laporan": usesMonthlyFallback ? `Agregat bulanan ${reportMonth!.label}` : "Sesuai tanggal file",
      Platform: PLATFORM_LABEL[platform],
      ADV: advName,
      Campaign: campaign || "-",
      "Waktu Dibuat Campaign": campaignCreatedAt || "-",
      "Adset / Grup Iklan": adset || "-",
      "Nama Iklan / Judul Video": adName || "-",
      "ID Iklan / Video": adId || "-",
      "Waktu Posting Video": creativePublishedAt || "-",
      "ID Campaign": campaignId || "-",
      "ID Produk": productId || "-",
      Spending: spend === null ? "-" : Math.round(spend),
      "Nilai Konversi Platform": purchaseValue === null ? "-" : Math.round(purchaseValue),
      "Impression / Tayangan": impressions,
      Click: clicks,
      "CTR (%)": ctr,
      "Konversi / Pesanan": leads,
      "Biaya per Pesanan (CPA)": costPerOrder === null ? "-" : Math.round(costPerOrder),
      "ROAS Platform": platformRoas,
      Status: deliveryStatus || "-",
    };
    return {
      rowNumber: index + 1,
      raw,
      parsed: {
        reportDate,
        reportEndDate,
        campaign,
        adset,
        adName,
        adId,
        creativePublishedAt,
        campaignCreatedAt,
        reportGranularity: usesMonthlyFallback ? "month" : "day",
        reportDateSource: usesMonthlyFallback ? "period" : "file",
        campaignId,
        productId,
        spend: spend === null ? null : Math.round(spend),
        impressions,
        clicks,
        leads,
        purchaseValue,
        deliveryStatus,
      },
      display,
      status,
      notes,
      duplicateKey,
      targetEntity: "ad_campaign_metrics",
    };
  });
  return finalizeFile(headers, parsedRows, fileErrors);
}
