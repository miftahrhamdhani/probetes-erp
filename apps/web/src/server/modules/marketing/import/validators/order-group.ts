/** Field header pesanan yang wajib identik pada seluruh item dalam satu invoice. */
export const ORDER_HEADER_FIELDS = [
  "orderDate",
  "customer",
  "phone",
  "total",
  "orderStatus",
  "paymentStatus",
  "paymentMethod",
  "trackingNumber",
  "courier",
  "city",
  "province",
  "address",
] as const;

type NormalizedOrderData = Record<string, string | number | null>;

/** Menjaga satu invoice tidak dipromosikan dengan dua nilai header yang berbeda. */
export function hasInconsistentOrderHeader(rows: NormalizedOrderData[]): boolean {
  return ORDER_HEADER_FIELDS.some((field) => {
    const values = new Set(rows
      .map((row) => String(row[field] ?? "").trim().toLocaleLowerCase("id-ID"))
      .filter(Boolean));
    return values.size > 1;
  });
}
