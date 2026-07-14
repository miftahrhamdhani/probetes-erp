import type {
  ImportCommitResponse,
  ImportHistoryEntry,
  ImportOptionsByPlatform,
  ImportPlatform,
  ImportPreviewResponse,
  ImportSourceOption,
  MarketplaceImportType,
} from "@/server/modules/marketing/import/import.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as Partial<ApiEnvelope<T>> & { message?: string };
  if (!response.ok) throw new Error(body.error ?? body.message ?? "Permintaan gagal diproses.");
  if ("data" in body) return body.data as T;
  return body as T;
}

export function fetchImportOptions(): Promise<ImportOptionsByPlatform> {
  return apiRequest<ImportOptionsByPlatform>("/api/marketing/import/options");
}

export function createImportOption(input: {
  platform: ImportPlatform;
  type: "adv" | "store";
  label: string;
}): Promise<ImportSourceOption> {
  return apiRequest<ImportSourceOption>("/api/marketing/import/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function renameImportOption(id: string, label: string): Promise<ImportSourceOption> {
  return apiRequest<ImportSourceOption>(`/api/marketing/import/options/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
}

export async function removeImportOption(id: string): Promise<void> {
  await apiRequest(`/api/marketing/import/options/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function previewMarketplaceImport(input: {
  file: File;
  platform: ImportPlatform;
  importType: MarketplaceImportType;
  advId: string | null;
  storeId: string | null;
  period: string;
  note: string;
}): Promise<ImportPreviewResponse> {
  const form = new FormData();
  form.set("file", input.file);
  form.set("platform", input.platform);
  form.set("importType", input.importType);
  if (input.advId) form.set("advId", input.advId);
  if (input.storeId) form.set("storeId", input.storeId);
  form.set("period", input.period);
  form.set("note", input.note);
  return apiRequest<ImportPreviewResponse>("/api/marketing/import/preview", { method: "POST", body: form });
}

export function commitMarketplaceImport(previewId: string): Promise<ImportCommitResponse> {
  return apiRequest<ImportCommitResponse>("/api/marketing/import/commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ previewId }),
  });
}

export async function cancelMarketplaceImport(previewId: string): Promise<void> {
  await apiRequest("/api/marketing/import/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ previewId }),
  });
}

export function fetchImportHistory(limit = 20): Promise<ImportHistoryEntry[]> {
  return apiRequest<ImportHistoryEntry[]>(`/api/marketing/import/history?limit=${limit}`);
}

export function fetchImportHistoryDetail(id: string): Promise<ImportHistoryEntry> {
  return apiRequest<ImportHistoryEntry>(`/api/marketing/import/history/${encodeURIComponent(id)}`);
}
