import type { PoolClient } from "pg";

/** Catat perubahan data utama. Identitas user akan diisi setelah IAM tersedia. */
export async function logChange(
  client: PoolClient,
  tableName: string,
  recordId: string,
  action: "update" | "archive" | "merge" | "restore" | "mapping",
  beforeData: unknown,
  afterData: unknown,
) {
  await client.query(
    `INSERT INTO audit.change_log (table_name, record_id, action, before_data, after_data)
     VALUES ($1, $2, $3, $4, $5)`,
    [tableName, recordId, action, JSON.stringify(beforeData), JSON.stringify(afterData)],
  );
}
