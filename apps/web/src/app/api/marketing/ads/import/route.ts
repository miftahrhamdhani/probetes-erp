import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { parseMetaAdsCsv } from "@/lib/marketing-ads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INSERT_METRIC_SQL = `
  INSERT INTO marketing.ad_campaign_metrics (
    batch_id, report_start_date, report_end_date, platform, campaign_name,
    campaign_created_at, campaign_delivery_status, product_label, account_code,
    advertiser_name, report_month, budget_value, budget_type, spend,
    checkout_started, cost_per_checkout, purchases, cost_per_purchase,
    purchase_value, platform_roas, link_clicks, cpc_link, landing_page_views,
    cost_per_landing_page_view, ctr_link, reach, impressions, cpm, frequency,
    add_to_cart, leads, cost_per_lead, video_3s_views, thruplays, avg_watch_time,
    video_played_25, video_played_50, video_played_75, video_played_95,
    source_file_name, raw_data
  ) VALUES (
    $1,$2,$3,'Meta Ads',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
    $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,
    $36,$37,$38,$39,$40
  )
`;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const year = Number(form.get("report_year") ?? 2025);
    const importedBy = String(form.get("imported_by") ?? "").trim() || null;

    if (!(file instanceof File)) return NextResponse.json({ error: "File CSV wajib dipilih." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ error: "Format file harus CSV." }, { status: 400 });
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Tahun laporan harus antara 2000 dan 2100." }, { status: 400 });
    }

    const parsed = parseMetaAdsCsv(await file.text(), file.name, year);
    if (parsed.missingRequiredHeaders.length) {
      return NextResponse.json({
        error: `Header wajib tidak ditemukan: ${parsed.missingRequiredHeaders.join(", ")}.`,
        supported_headers: ["Nama Kampanye", "Jumlah yang dibelanjakan (IDR)"],
      }, { status: 400 });
    }
    if (!parsed.rows.length) {
      return NextResponse.json({ error: "Tidak ada baris kampanye valid yang bisa diimport." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const batch = await client.query<{ batch_id: string }>(`
        INSERT INTO marketing.ad_import_batches (
          file_name, file_label, platform, product_label, account_code, advertiser_name,
          report_month, report_year, status, total_rows, success_rows, imported_by,
          raw_file_metadata, processed_at
        ) VALUES ($1,$2,'Meta Ads',$3,$4,$5,$6,$7,'pending',$8,0,$9,$10,now())
        RETURNING batch_id
      `, [
        file.name, parsed.fileLabel, parsed.productLabel, parsed.accountCode, parsed.advertiserName,
        parsed.reportMonth, year, parsed.rows.length, importedBy,
        JSON.stringify({ size: file.size, type: file.type, headers: Object.keys(parsed.rows[0]?.rawData ?? {}) }),
      ]);
      const batchId = batch.rows[0]!.batch_id;

      for (const row of parsed.rows) {
        await client.query(INSERT_METRIC_SQL, [
          batchId, row.reportStartDate, row.reportEndDate, row.campaignName,
          row.campaignCreatedAt, row.campaignDeliveryStatus, parsed.productLabel, parsed.accountCode,
          parsed.advertiserName, parsed.reportMonth, row.budgetValue, row.budgetType, row.spend,
          row.checkoutStarted, row.costPerCheckout, row.purchases, row.costPerPurchase, row.purchaseValue,
          row.platformRoas, row.linkClicks, row.cpcLink, row.landingPageViews, row.costPerLandingPageView,
          row.ctrLink, row.reach, row.impressions, row.cpm, row.frequency, row.addToCart, row.leads,
          row.costPerLead, row.video3sViews, row.thruplays, row.avgWatchTime, row.videoPlayed25,
          row.videoPlayed50, row.videoPlayed75, row.videoPlayed95, file.name, JSON.stringify(row.rawData),
        ]);
      }
      await client.query(`
        UPDATE marketing.ad_import_batches
        SET status = 'success', success_rows = $2, processed_at = now()
        WHERE batch_id = $1
      `, [batchId, parsed.rows.length]);
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        data: {
          batch_id: batchId, file_name: file.name, total_rows: parsed.rows.length,
          success_rows: parsed.rows.length, failed_rows: 0,
          report_start_date: parsed.rows[0]!.reportStartDate,
          report_end_date: parsed.rows[0]!.reportEndDate,
        },
      }, { status: 201 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("POST /api/marketing/ads/import gagal:", err);
    return NextResponse.json({ error: `Gagal mengimport data iklan: ${message}` }, { status: 500 });
  }
}
