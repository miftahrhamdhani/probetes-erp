import { extractCityFromAddress } from "@/server/common/utils/location";
import { findCustomersForMasterData } from "./customers.repository";
import type { CustomerListItem, CustomerSourceInfo } from "./customers.types";
import {
  assessCustomer,
  classifySource,
  displayPhone,
  displayPlatformChannel,
  displaySource,
  displayText,
  mapCustomerStatus,
} from "./customers.utils";

export async function getCustomersForMasterData(): Promise<CustomerListItem[]> {
  const rows = await findCustomersForMasterData();

  return rows.map((row) => {
    const firstSource: CustomerSourceInfo = {
      name: row.first_channel_name,
      type: row.first_channel_type,
      platform: row.first_channel_platform,
    };
    const lastSource: CustomerSourceInfo = {
      name: row.last_channel_name,
      type: row.last_channel_type,
      platform: row.last_channel_platform,
    };
    const dominantSource: CustomerSourceInfo = {
      name: row.dominant_channel_name,
      type: row.dominant_channel_type,
      platform: row.dominant_channel_platform,
    };
    const firstSourceLabel = displaySource(firstSource);
    const lastSourceLabel = displaySource(lastSource);
    const dominantSourceLabel = displaySource(dominantSource);
    const platformSource = dominantSourceLabel !== "Belum Tercatat"
      ? dominantSource
      : lastSourceLabel !== "Belum Tercatat"
        ? lastSource
        : firstSource;
    const hasClearSource = [firstSourceLabel, lastSourceLabel, dominantSourceLabel]
      .some((source) => source !== "Belum Tercatat");
    const assessment = assessCustomer(row, hasClearSource);
    const customerStatus = mapCustomerStatus(row.status_raw, assessment.isComplete);
    const address = displayText(row.address);

    return {
      id: row.id,
      name: displayText(row.name),
      phone: displayPhone(row),
      address,
      city: extractCityFromAddress(address === "-" ? "" : address, row.city ?? "") || "-",
      province: displayText(row.province),
      source: dominantSourceLabel,
      trx: Number(row.total_transactions ?? 0),
      status: customerStatus,
      firstPurchase: row.first_purchase ?? "",
      lastTransaction: row.last_transaction ?? "",
      firstSource: firstSourceLabel,
      lastSource: lastSourceLabel,
      platformChannel: displayPlatformChannel(platformSource),
      sourceCategory: classifySource(firstSource, lastSource, dominantSource, row.source_origin),
      totalTransactions: Number(row.total_transactions ?? 0),
      totalPurchase: Number(row.total_purchase ?? 0),
      customerStatus,
      ...assessment,
    };
  });
}
