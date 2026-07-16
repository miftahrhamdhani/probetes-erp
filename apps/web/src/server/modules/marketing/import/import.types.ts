export type ImportPlatform = "tiktok" | "shopee" | "meta";
export type MarketplaceImportType = "ads" | "order";
export type ImportValidationStatus = "valid" | "review" | "error" | "duplicate";
export type ImportBatchStatus =
  | "preview"
  | "processing"
  | "completed"
  | "cancelled"
  | "failed"
  | "expired";

export interface ImportSourceOption {
  id: string;
  platform: ImportPlatform;
  type: "adv" | "store";
  label: string;
}

export type ImportOptionsByPlatform = Record<
  ImportPlatform,
  { adv: ImportSourceOption[]; stores: ImportSourceOption[] }
>;

export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  reviewRows: number;
  errorRows: number;
  duplicateRows: number;
}

export interface ImportPreviewRow {
  rowId?: number;
  rowNumber: number;
  status: ImportValidationStatus;
  notes: string[];
  data: Record<string, string | number | null>;
}

export interface ImportPreviewResponse extends ImportValidationSummary {
  previewId: string;
  batchId: string;
  fileName: string;
  platform: ImportPlatform;
  importType: MarketplaceImportType;
  sourceName: string;
  periodStart: string | null;
  periodEnd: string | null;
  columns: string[];
  rows: ImportPreviewRow[];
  validationSummary: ImportValidationSummary;
  errors: string[];
}

export interface ImportHistoryEntry extends ImportValidationSummary {
  id: string;
  createdAt: string;
  platform: ImportPlatform;
  importType: MarketplaceImportType;
  advName: string | null;
  storeName: string | null;
  periodLabel: string | null;
  fileName: string;
  status: ImportBatchStatus;
  importedRows: number;
  failedRows: number;
  committedAt: string | null;
  rows?: ImportPreviewRow[];
  columns?: string[];
}

export interface ImportCommitResponse {
  success: true;
  batchId: string;
  importedRows: number;
  reviewRows: number;
  failedRows: number;
  message: string;
}

export interface ParsedImportRow {
  rowNumber: number;
  raw: Record<string, string>;
  parsed: Record<string, string | number | null>;
  display: Record<string, string | number | null>;
  status: ImportValidationStatus;
  notes: string[];
  duplicateKey: string | null;
  targetEntity: "ad_campaign_metrics" | "orders";
}

export interface ParsedImportFile {
  headers: string[];
  columns: string[];
  rows: ParsedImportRow[];
  periodStart: string | null;
  periodEnd: string | null;
  fileErrors: string[];
}

export interface AdminInputerItem {
  productId: string | null;
  productName: string;
  quantity: number | null;
  unitPrice: number | null;
  subtotal: number | null;
  status: string | null;
}

export interface AdminInputerResult {
  orderId: string;
  orderDate: string | null;
  platform: ImportPlatform;
  storeId: string;
  storeName: string;
  orderStatus: string | null;
  paymentMethod: string | null;
  totalAmount: number | null;
  channel: string | null;
  courier: string | null;
  trackingNumber: string | null;
  packageStatus: string | null;
  customerId: string;
  customerVersion: string;
  customer: { name: string; phone: string; address: string; city: string; province: string };
  items: AdminInputerItem[];
  phoneCandidates: Array<{ customerId: string; name: string; transactionCount: number }>;
}

export interface AdminInputerUpdateInput {
  orderId: string;
  customerId: string;
  customerVersion: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  acknowledgeDuplicatePhone?: boolean;
}
