import { query } from "@/server/common/db";
import type { CustomerRepositoryRow } from "./customers.types";

// Semua metrik pelanggan dihitung sekali dalam CTE agar tidak memicu query per
// baris. Tidak ada UPDATE/DELETE: repository ini khusus tampilan read-only.
const CUSTOMERS_SQL = `
  WITH active_customers AS (
    SELECT *
    FROM master.customers
    WHERE status IS DISTINCT FROM 'archived'
  ),
  ranked_orders AS (
    SELECT
      o.customer_id,
      o.order_id,
      o.order_date,
      o.channel_id,
      o.total_amount,
      ROW_NUMBER() OVER (
        PARTITION BY o.customer_id
        ORDER BY o.order_date ASC NULLS LAST, o.order_id ASC
      ) AS first_rank,
      ROW_NUMBER() OVER (
        PARTITION BY o.customer_id
        ORDER BY o.order_date DESC NULLS LAST, o.order_id DESC
      ) AS last_rank
    FROM orders.orders o
  ),
  order_stats AS (
    SELECT
      customer_id,
      to_char(min(order_date), 'YYYY-MM-DD') AS first_purchase,
      to_char(max(order_date), 'YYYY-MM-DD') AS last_transaction,
      count(*)::int AS total_transactions,
      COALESCE(sum(total_amount), 0)::bigint AS total_purchase,
      max(channel_id) FILTER (WHERE first_rank = 1) AS first_channel_id,
      max(channel_id) FILTER (WHERE last_rank = 1) AS last_channel_id
    FROM ranked_orders
    GROUP BY customer_id
  ),
  dominant_channel AS (
    SELECT customer_id, channel_id
    FROM (
      SELECT
        o.customer_id,
        o.channel_id,
        ROW_NUMBER() OVER (
          PARTITION BY o.customer_id
          ORDER BY count(*) DESC, o.channel_id ASC
        ) AS rank
      FROM orders.orders o
      WHERE o.channel_id IS NOT NULL
      GROUP BY o.customer_id, o.channel_id
    ) channels
    WHERE rank = 1
  ),
  duplicate_phones AS (
    SELECT phone_normalized
    FROM active_customers
    WHERE NULLIF(trim(phone_normalized), '') IS NOT NULL
    GROUP BY phone_normalized
    HAVING count(*) > 1
  ),
  duplicate_identities AS (
    SELECT
      lower(regexp_replace(trim(name), '\\s+', ' ', 'g')) AS normalized_name,
      lower(regexp_replace(trim(address), '\\s+', ' ', 'g')) AS normalized_address
    FROM active_customers
    WHERE NULLIF(trim(name), '') IS NOT NULL
      AND NULLIF(trim(address), '') IS NOT NULL
    GROUP BY 1, 2
    HAVING count(*) > 1
  )
  SELECT
    cu.customer_id AS id,
    cu.name,
    cu.phone,
    cu.phone_normalized,
    cu.address,
    cu.city,
    cu.province,
    cu.source_origin,
    cu.status AS status_raw,
    COALESCE(os.first_purchase, to_char(cc.first_purchase_date, 'YYYY-MM-DD')) AS first_purchase,
    os.last_transaction,
    COALESCE(os.total_transactions, cu.transaction_count, 0)::int AS total_transactions,
    COALESCE(os.total_purchase, 0)::bigint AS total_purchase,
    first_ch.channel_final_name AS first_channel_name,
    first_ch.type AS first_channel_type,
    first_ch.platform AS first_channel_platform,
    last_ch.channel_final_name AS last_channel_name,
    last_ch.type AS last_channel_type,
    last_ch.platform AS last_channel_platform,
    dominant_ch.channel_final_name AS dominant_channel_name,
    dominant_ch.type AS dominant_channel_type,
    dominant_ch.platform AS dominant_channel_platform,
    (dp.phone_normalized IS NOT NULL) AS duplicate_phone,
    (di.normalized_name IS NOT NULL) AS duplicate_identity
  FROM active_customers cu
  LEFT JOIN order_stats os ON os.customer_id = cu.customer_id
  LEFT JOIN master.customer_cohorts cc ON cc.customer_id = cu.customer_id
  LEFT JOIN dominant_channel dc ON dc.customer_id = cu.customer_id
  LEFT JOIN master.channels first_ch ON first_ch.channel_id = os.first_channel_id
  LEFT JOIN master.channels last_ch ON last_ch.channel_id = os.last_channel_id
  LEFT JOIN master.channels dominant_ch ON dominant_ch.channel_id = dc.channel_id
  LEFT JOIN duplicate_phones dp ON dp.phone_normalized = cu.phone_normalized
  LEFT JOIN duplicate_identities di
    ON di.normalized_name = lower(regexp_replace(trim(cu.name), '\\s+', ' ', 'g'))
   AND di.normalized_address = lower(regexp_replace(trim(cu.address), '\\s+', ' ', 'g'))
  ORDER BY os.last_transaction DESC NULLS LAST, length(cu.customer_id), cu.customer_id
`;

export function findCustomersForMasterData() {
  return query<CustomerRepositoryRow>(CUSTOMERS_SQL);
}
