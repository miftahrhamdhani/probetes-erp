import { available, partial, type AvailabilityMap } from "@/lib/availability";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface MarketingOrderFilters {
  startDate: string;
  endDate: string;
  channelId: string | null;
  divisi: string | null;
  productId: string | null;
  csId: string | null;
  search: string | null;
}

function date(value: string | null, label: string): string {
  if (!value || !ISO_DATE.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) throw new Error(`${label} wajib berformat YYYY-MM-DD.`);
  return value;
}

/** Query filter order valid; semua nilai user selalu parameterized. */
export function marketingOrderFilters(params: URLSearchParams): MarketingOrderFilters {
  const startDate = date(params.get("start_date"), "start_date");
  const endDate = date(params.get("end_date"), "end_date");
  if (startDate > endDate) throw new Error("start_date tidak boleh lebih besar dari end_date.");
  const text = (name: string) => params.get(name)?.trim() || null;
  return { startDate, endDate, channelId: text("channel_id"), divisi: text("divisi"), productId: text("product_id"), csId: text("cs_id"), search: text("search") };
}

/** WHERE untuk orders.orders alias `o`; flag valid adalah satu-satunya definisi order valid. */
export function validOrderWhere(filters: MarketingOrderFilters) {
  const where = ["o.flag = 'valid'", "o.order_date >= $1", "o.order_date <= $2"];
  const values: unknown[] = [filters.startDate, filters.endDate];
  const add = (sql: string, value: string | null) => { if (value) { values.push(value); where.push(`${sql} $${values.length}`); } };
  if (filters.channelId === "BELUM_TERCATAT") where.push("o.channel_id IS NULL");
  else add("o.channel_id =", filters.channelId);
  add("o.divisi =", filters.divisi);
  add("o.cs_id =", filters.csId);
  if (filters.productId) {
    values.push(filters.productId);
    where.push(`EXISTS (SELECT 1 FROM orders.order_items oi_filter WHERE oi_filter.order_id = o.order_id AND oi_filter.product_id = $${values.length})`);
  }
  if (filters.search) {
    values.push(`%${filters.search}%`);
    where.push(`(o.order_id ILIKE $${values.length} OR EXISTS (SELECT 1 FROM master.customers c_filter WHERE c_filter.customer_id = o.customer_id AND c_filter.name ILIKE $${values.length}))`);
  }
  return { where: where.join(" AND "), values };
}

export function pageParams(params: URLSearchParams) {
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1);
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 25) || 25, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

export const SOURCE_AVAILABILITY: AvailabilityMap = {
  total_order: available(), revenue: available(), aov: available(), product_sold: available(),
  retur_rate: partial("Status retur tersedia dari pengiriman, tetapi tanggal retur belum tercatat; filter mengikuti tanggal pesanan."),
};
