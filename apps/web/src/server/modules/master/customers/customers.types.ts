export type CustomerCompletenessStatus =
  | "Lengkap"
  | "Belum Lengkap"
  | "Tersensor"
  | "Perlu Validasi";

export type CustomerValidationStatus =
  | "Valid"
  | "Perlu Dicek"
  | "Potensi Duplikat"
  | "Belum Bisa Dipastikan";

export type CustomerSourceCategory =
  | "TikTok"
  | "Shopee"
  | "Meta/Akuisisi"
  | "CRM"
  | "Lainnya"
  | "Belum Tercatat";

export type CustomerDataView = "complete" | "validation";

export interface CustomerRepositoryRow {
  id: string;
  name: string | null;
  phone: string | null;
  phone_normalized: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  source_origin: string | null;
  status_raw: string | null;
  first_purchase: string | null;
  last_transaction: string | null;
  total_transactions: number;
  total_purchase: number;
  first_channel_name: string | null;
  first_channel_type: string | null;
  first_channel_platform: string | null;
  last_channel_name: string | null;
  last_channel_type: string | null;
  last_channel_platform: string | null;
  dominant_channel_name: string | null;
  dominant_channel_type: string | null;
  dominant_channel_platform: string | null;
  duplicate_phone: boolean;
  duplicate_identity: boolean;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  /** Alias kompatibilitas API lama: channel penjualan dominan. */
  source: string;
  /** Alias kompatibilitas API lama. */
  trx: number;
  /** Status segmentasi hanya ditampilkan saat identitas dapat dipercaya. */
  status: string;
  /** Alias kompatibilitas API lama. */
  firstPurchase: string;
  lastTransaction: string;
  firstSource: string;
  lastSource: string;
  platformChannel: string;
  sourceCategory: CustomerSourceCategory;
  totalTransactions: number;
  totalPurchase: number;
  customerStatus: string;
  completenessStatus: CustomerCompletenessStatus;
  validationStatus: CustomerValidationStatus;
  validationReason: string;
  recommendation: string;
  isComplete: boolean;
  needsValidation: boolean;
  isPotentialDuplicate: boolean;
  dataView: CustomerDataView;
}

export interface CustomerAssessment {
  isComplete: boolean;
  needsValidation: boolean;
  isPotentialDuplicate: boolean;
  dataView: CustomerDataView;
  completenessStatus: CustomerCompletenessStatus;
  validationStatus: CustomerValidationStatus;
  validationReason: string;
  recommendation: string;
}

export interface CustomerSourceInfo {
  name: string | null;
  type: string | null;
  platform: string | null;
}
