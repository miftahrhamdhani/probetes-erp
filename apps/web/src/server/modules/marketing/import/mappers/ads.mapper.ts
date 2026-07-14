import type { ImportPlatform, ImportValidationStatus, ParsedImportFile, ParsedImportRow } from "../import.types";
import { parseImportDate, parseImportNumber, PLATFORM_LABEL } from "../utils";
import { escalateStatus, finalizeFile } from "../validators/row-status";
import { ADS_ALIASES } from "./aliases";
import { buildHeaderLookup, detectPlatformMismatch, field, findHeader } from "./header";

/** Mapping + validasi baris Spending Ads ke bentuk ParsedImportFile. */
export function mapAdsRows(
  rows: Record<string, string>[],
  headers: string[],
  platform: ImportPlatform,
  advName: string,
): ParsedImportFile {
  const lookup = buildHeaderLookup(headers);
  const mappedHeaders = Object.fromEntries(
    Object.entries(ADS_ALIASES).map(([key, aliases]) => [key, findHeader(lookup, aliases)]),
  ) as Record<keyof typeof ADS_ALIASES, string | null>;
  const fileErrors: string[] = [];
  const missing = [
    [mappedHeaders.reportDate, "tanggal"],
    [mappedHeaders.campaign, "campaign"],
    [mappedHeaders.spend, "spending"],
  ].filter(([header]) => !header).map(([, label]) => label as string);
  if (missing.length) fileErrors.push(`Kolom wajib tidak ditemukan: ${missing.join(", ")}.`);
  const mismatch = detectPlatformMismatch(headers, platform);
  if (mismatch) fileErrors.push(mismatch);

  const seen = new Set<string>();
  const parsedRows: ParsedImportRow[] = rows.map((raw, index) => {
    let status: ImportValidationStatus = "valid";
    const notes = [...fileErrors];
    if (fileErrors.length) status = "error";
    const reportDateRaw = field(raw, mappedHeaders.reportDate);
    const reportDate = parseImportDate(reportDateRaw);
    const reportEndDateRaw = field(raw, mappedHeaders.reportEndDate);
    const reportEndDate = reportEndDateRaw ? parseImportDate(reportEndDateRaw) : reportDate;
    const campaign = field(raw, mappedHeaders.campaign);
    const spendRaw = field(raw, mappedHeaders.spend);
    const spend = parseImportNumber(spendRaw);

    if (!reportDateRaw) {
      status = escalateStatus(status, "review");
      notes.push("Tanggal belum diisi.");
    } else if (!reportDate) {
      status = escalateStatus(status, "error");
      notes.push("Format tanggal tidak valid.");
    }
    if (reportEndDateRaw && !reportEndDate) {
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
    const campaignId = field(raw, mappedHeaders.campaignId);
    const productId = field(raw, mappedHeaders.productId);
    const impressions = number(mappedHeaders.impressions);
    const clicks = number(mappedHeaders.clicks);
    const leads = number(mappedHeaders.leads);
    const purchaseValue = number(mappedHeaders.purchaseValue);
    const deliveryStatus = field(raw, mappedHeaders.status);
    const duplicateKey = reportDate && campaign
      ? [platform, advName, reportDate, campaign, adName].map((part) => part.toLocaleLowerCase("id-ID").trim()).join("|")
      : null;
    if (duplicateKey && seen.has(duplicateKey) && status !== "error") {
      status = "duplicate";
      notes.push("Baris duplikat ditemukan di file yang sama.");
    }
    if (duplicateKey) seen.add(duplicateKey);

    const display = {
      Tanggal: reportDate ?? (reportDateRaw || "-"),
      "Tanggal Akhir": reportEndDate ?? (reportEndDateRaw || reportDate || "-"),
      Platform: PLATFORM_LABEL[platform],
      ADV: advName,
      Campaign: campaign || "-",
      "Adset / Grup Iklan": adset || "-",
      "Nama Iklan": adName || "-",
      "ID Campaign": campaignId || "-",
      "ID Produk": productId || "-",
      Spending: spend === null ? "-" : Math.round(spend),
      "Impression / Tayangan": impressions,
      Click: clicks,
      "Leads / Result": leads,
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
