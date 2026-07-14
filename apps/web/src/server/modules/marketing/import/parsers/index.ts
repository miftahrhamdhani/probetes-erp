import type { ImportPlatform, MarketplaceImportType, ParsedImportFile } from "../import.types";
import { mapAdsRows } from "../mappers/ads.mapper";
import { mapOrderRows } from "../mappers/order.mapper";
import { readTabularFile } from "./file-reader";

export { ImportFileError } from "./file-reader";

/** Baca file lalu petakan/validasi baris sesuai jenis import (ads/order). */
export async function parseMarketplaceImport(
  file: File,
  platform: ImportPlatform,
  importType: MarketplaceImportType,
  sourceName: string,
): Promise<ParsedImportFile> {
  const tabular = await readTabularFile(file);
  return importType === "ads"
    ? mapAdsRows(tabular.rows, tabular.headers, platform, sourceName)
    : mapOrderRows(tabular.rows, tabular.headers, platform, sourceName);
}
