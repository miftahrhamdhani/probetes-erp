/** Escape 1 nilai sesuai aturan CSV (RFC 4180): bungkus kutip dua jika perlu. */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Ubah array of object menjadi teks CSV, kolom diambil dari key baris pertama. */
export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0] as Record<string, unknown>);
  const header = columns.map(escapeCsvValue).join(",");
  const body = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(",")).join("\r\n");
  return `${header}\r\n${body}`;
}
