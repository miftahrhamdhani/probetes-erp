import type { ImportPlatform, MarketplaceImportType, ParsedImportFile } from "../import.types";
import { mapAdsRows } from "../mappers/ads.mapper";
import { mapOrderRows } from "../mappers/order.mapper";
import { detectPlatformMismatch } from "../mappers/header";
import { ImportFileError, readTabularFile } from "./file-reader";

export { ImportFileError } from "./file-reader";

/** Baca file lalu petakan/validasi baris sesuai jenis import (ads/order). */
export async function parseMarketplaceImport(
  file: File,
  platform: ImportPlatform,
  importType: MarketplaceImportType,
  sourceName: string,
  periodLabel = "",
): Promise<ParsedImportFile> {
  const tabular = await readTabularFile(file, importType, importType === "ads" && platform === "tiktok" && Boolean(periodLabel.trim()));
  const mismatch = detectPlatformMismatch(tabular.headers, platform);
  if (mismatch) throw new ImportFileError(mismatch);
  return importType === "ads"
    ? mapAdsRows(tabular.rows, tabular.headers, platform, sourceName, periodLabel)
    : mapOrderRows(tabular.rows, tabular.headers, platform, sourceName);
}
