import type {
  CustomerAssessment,
  CustomerRepositoryRow,
  CustomerSourceCategory,
  CustomerSourceInfo,
} from "./customers.types";

const MASKED_PATTERN = /(?:\*{2,}|x{3,}|•{2,}|sensor|masked|disamarkan)/i;
const EMPTY_PATTERN = /^(?:-|n\/?a|none|null|unknown|tidak diketahui|belum tercatat)$/i;

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function isEmpty(value: string | null | undefined) {
  const text = normalized(value);
  return !text || EMPTY_PATTERN.test(text);
}

function isMasked(value: string | null | undefined) {
  return MASKED_PATTERN.test(normalized(value));
}

function isValidName(value: string | null | undefined) {
  const text = normalized(value);
  return !isEmpty(text) && !isMasked(text) && text.length > 1 && /[a-z]/i.test(text) && !/error/i.test(text);
}

function phoneDigits(row: CustomerRepositoryRow) {
  const raw = normalized(row.phone_normalized || row.phone).replace(/\D/g, "");
  return raw.startsWith("0") ? `62${raw.slice(1)}` : raw;
}

function isValidPhone(row: CustomerRepositoryRow) {
  return /^62[0-9]{8,13}$/.test(phoneDigits(row)) && !isMasked(row.phone_normalized || row.phone);
}

function isValidAddress(value: string | null | undefined) {
  const text = normalized(value);
  return !isEmpty(text) && !isMasked(text) && text.length >= 5;
}

export function displayText(value: string | null | undefined) {
  return isEmpty(value) ? "-" : normalized(value);
}

export function displayPhone(row: CustomerRepositoryRow) {
  const digits = phoneDigits(row);
  if (!digits) return "-";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return displayText(row.phone_normalized || row.phone);
}

export function displaySource(source: CustomerSourceInfo) {
  const name = normalized(source.name);
  return !name || /^unknown$/i.test(name) ? "Belum Tercatat" : name;
}

export function displayPlatformChannel(source: CustomerSourceInfo) {
  const name = displaySource(source);
  if (name === "Belum Tercatat") return name;
  const platform = normalized(source.platform);
  const type = normalized(source.type);
  const context = platform || type;
  return context && context.toLocaleLowerCase("id-ID") !== name.toLocaleLowerCase("id-ID")
    ? `${context} / ${name}`
    : name;
}

export function classifySource(
  first: CustomerSourceInfo,
  last: CustomerSourceInfo,
  dominant: CustomerSourceInfo,
  sourceOrigin: string | null,
): CustomerSourceCategory {
  // Source akuisisi memakai channel pertama yang jelas. Fallback ke channel
  // dominan lalu terakhir; riwayat lintas-channel tidak boleh membuat satu
  // pelanggan masuk kategori yang kebetulan diperiksa lebih dulu oleh regex.
  const candidates = [first, dominant, last];
  const canonical = candidates.find((source) => displaySource(source) !== "Belum Tercatat");
  const text = (canonical
    ? [canonical.name, canonical.type, canonical.platform].filter(Boolean).join(" ")
    : normalized(sourceOrigin)).toLocaleLowerCase("id-ID");

  if (/tiktok/.test(text)) return "TikTok";
  if (/shopee/.test(text)) return "Shopee";
  if (/\bcrm\b/.test(text)) return "CRM";
  if (/meta|facebook|instagram|akuisisi/.test(text)) return "Meta/Akuisisi";
  if (!canonical || !text || /unknown|belum tercatat/.test(text)) return "Belum Tercatat";
  return "Lainnya";
}

export function mapCustomerStatus(status: string | null, canClassify: boolean) {
  if (!canClassify) return "Belum Bisa Dipastikan";
  const labels: Record<string, string> = {
    baru: "Baru",
    repeat: "Repeat",
    high_value: "High Value",
    review: "Perlu Dicek",
  };
  return labels[normalized(status).toLocaleLowerCase("id-ID")] ?? displayText(status);
}

export function assessCustomer(row: CustomerRepositoryRow, hasClearSource: boolean): CustomerAssessment {
  const nameMasked = isMasked(row.name);
  const phoneMasked = isMasked(row.phone_normalized || row.phone);
  const addressMasked = isMasked(row.address);
  const maskedFields = [
    nameMasked ? "nama" : "",
    phoneMasked ? "No. HP/WA" : "",
    addressMasked ? "alamat" : "",
  ].filter(Boolean);

  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  if (!isValidName(row.name) && !nameMasked) {
    (isEmpty(row.name) ? missingFields : invalidFields).push("nama");
  }
  if (!isValidPhone(row) && !phoneMasked) {
    (isEmpty(row.phone_normalized || row.phone) ? missingFields : invalidFields).push("No. HP/WA");
  }
  if (!isValidAddress(row.address) && !addressMasked) {
    (isEmpty(row.address) ? missingFields : invalidFields).push("alamat");
  }
  if (!hasClearSource) missingFields.push("sumber transaksi");

  const isPotentialDuplicate = row.duplicate_phone || row.duplicate_identity;
  const isComplete = maskedFields.length === 0 && missingFields.length === 0 && invalidFields.length === 0;
  const needsValidation = !isComplete || isPotentialDuplicate;
  const dataView = needsValidation ? "validation" : "complete";

  const reasons: string[] = [];
  if (maskedFields.length) reasons.push(`${maskedFields.join(", ")} tersensor`);
  if (missingFields.length) reasons.push(`${missingFields.join(", ")} belum tersedia`);
  if (invalidFields.length) reasons.push(`${invalidFields.join(", ")} tidak valid`);
  if (row.duplicate_phone) reasons.push("No. HP/WA sama dengan pelanggan lain");
  if (row.duplicate_identity) reasons.push("nama dan alamat sama dengan pelanggan lain");

  const recommendations: string[] = [];
  if (maskedFields.length) recommendations.push("Minta data tanpa sensor dari sumber resmi");
  if (missingFields.length) recommendations.push(`Lengkapi ${missingFields.join(", ")}`);
  if (invalidFields.includes("No. HP/WA")) recommendations.push("Verifikasi format No. HP/WA");
  if (invalidFields.some((field) => field !== "No. HP/WA")) recommendations.push("Perbaiki identitas yang tidak valid");
  if (isPotentialDuplicate) recommendations.push("Audit identitas dan riwayat pada data sumber");

  return {
    isComplete,
    needsValidation,
    isPotentialDuplicate,
    dataView,
    completenessStatus: maskedFields.length
      ? "Tersensor"
      : !isComplete
        ? "Belum Lengkap"
        : isPotentialDuplicate
          ? "Perlu Validasi"
          : "Lengkap",
    validationStatus: isPotentialDuplicate
      ? "Potensi Duplikat"
      : maskedFields.length || invalidFields.length
        ? "Belum Bisa Dipastikan"
        : needsValidation
          ? "Perlu Dicek"
          : "Valid",
    validationReason: reasons.join("; ") || "Tidak ada masalah terdeteksi",
    recommendation: recommendations.join("; ") || "Tidak perlu tindakan",
  };
}
