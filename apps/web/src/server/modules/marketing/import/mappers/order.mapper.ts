import type { ImportPlatform, ImportValidationStatus, ParsedImportFile, ParsedImportRow } from "../import.types";
import { normalizeImportPhone, parseImportDate, parseImportNumber, PLATFORM_LABEL } from "../utils";
import { escalateStatus, finalizeFile } from "../validators/row-status";
import { ORDER_ALIASES } from "./aliases";
import { buildHeaderLookup, detectPlatformMismatch, field, findHeader } from "./header";

/** Mapping + validasi baris Data Pesanan ke bentuk ParsedImportFile. */
export function mapOrderRows(
  rows: Record<string, string>[],
  headers: string[],
  platform: ImportPlatform,
  storeName: string,
): ParsedImportFile {
  const lookup = buildHeaderLookup(headers);
  const mappedHeaders = Object.fromEntries(
    Object.entries(ORDER_ALIASES).map(([key, aliases]) => [key, findHeader(lookup, aliases)]),
  ) as Record<keyof typeof ORDER_ALIASES, string | null>;
  const orderDateHeaders = [...new Set(ORDER_ALIASES.orderDate
    .map((alias) => findHeader(lookup, [alias]))
    .filter((header): header is string => Boolean(header)))];
  const fileErrors: string[] = [];
  const missing = [
    [mappedHeaders.orderDate, "tanggal pesanan"],
    [mappedHeaders.invoice, "no invoice / ID pesanan"],
    [mappedHeaders.customer, "customer"],
    [mappedHeaders.product, "produk"],
    [mappedHeaders.qty, "qty"],
    [mappedHeaders.total, "total bayar"],
  ].filter(([header]) => !header).map(([, label]) => label as string);
  if (missing.length) fileErrors.push(`Kolom wajib tidak ditemukan: ${missing.join(", ")}.`);
  const mismatch = detectPlatformMismatch(headers, platform);
  if (mismatch) fileErrors.push(mismatch);

  const seen = new Set<string>();
  const sourceRows = rows.map((raw, index) => ({ raw, index })).filter(({ raw }) => {
    const signature = [
      field(raw, mappedHeaders.invoice),
      field(raw, mappedHeaders.orderDate),
      field(raw, mappedHeaders.product),
      field(raw, mappedHeaders.qty),
      field(raw, mappedHeaders.total),
    ].join(" ");
    return !/(?:platform unique order id|order created time|sku sold quantity|order total amount paid)/i.test(signature);
  });
  const parsedRows: ParsedImportRow[] = sourceRows.map(({ raw, index }) => {
    let status: ImportValidationStatus = fileErrors.length ? "error" : "valid";
    const notes = [...fileErrors];
    const orderDateRaw = orderDateHeaders.map((header) => field(raw, header)).find(Boolean) ?? "";
    const orderDate = parseImportDate(orderDateRaw);
    const invoice = field(raw, mappedHeaders.invoice);
    const customer = field(raw, mappedHeaders.customer);
    const phoneRaw = field(raw, mappedHeaders.phone);
    const isMaskedPhone = /[*x]/i.test(phoneRaw);
    const phoneNormalized = isMaskedPhone ? null : normalizeImportPhone(phoneRaw);
    const product = field(raw, mappedHeaders.product);
    const qtyRaw = field(raw, mappedHeaders.qty);
    const qtyNumber = parseImportNumber(qtyRaw);
    const qty = qtyNumber === null ? null : Math.trunc(qtyNumber);
    const totalRaw = field(raw, mappedHeaders.total);
    const total = parseImportNumber(totalRaw);
    const unitPriceRaw = field(raw, mappedHeaders.unitPrice);
    const unitPrice = unitPriceRaw ? parseImportNumber(unitPriceRaw) : null;
    const itemSubtotalRaw = field(raw, mappedHeaders.itemSubtotal);
    const itemSubtotal = itemSubtotalRaw ? parseImportNumber(itemSubtotalRaw) : null;

    const missingValues = [
      [orderDateRaw, "Tanggal pesanan"], [invoice, "No invoice"], [customer, "Customer"],
      [product, "Produk"], [qtyRaw, "Qty"], [totalRaw, "Total bayar"],
    ].filter(([value]) => !value).map(([, label]) => label as string);
    if (missingValues.length) {
      status = escalateStatus(status, "review");
      notes.push(`${missingValues.join(", ")} belum diisi.`);
    }
    if (orderDateRaw && !orderDate) {
      status = escalateStatus(status, "error");
      notes.push("Format tanggal pesanan tidak valid.");
    }
    if (qtyRaw && (qty === null || qty <= 0 || qtyNumber !== qty)) {
      status = escalateStatus(status, "error");
      notes.push("Qty harus berupa angka bulat lebih dari 0.");
    }
    if (totalRaw && (total === null || total < 0)) {
      status = escalateStatus(status, "error");
      notes.push("Total bayar tidak valid.");
    }
    if (unitPriceRaw && (unitPrice === null || unitPrice < 0)) {
      status = escalateStatus(status, "error");
      notes.push("Harga produk tidak valid.");
    }
    if (itemSubtotalRaw && (itemSubtotal === null || itemSubtotal < 0)) {
      status = escalateStatus(status, "error");
      notes.push("Subtotal produk tidak valid.");
    }
    if (!phoneRaw) {
      status = escalateStatus(status, "review");
      notes.push("Nomor HP belum diisi.");
    } else if (isMaskedPhone) {
      notes.push("Nomor HP tersensor oleh marketplace; lengkapi melalui Admin Inputer setelah import.");
    } else if (!phoneNormalized) {
      status = escalateStatus(status, "review");
      notes.push("Nomor HP perlu dicek.");
    }

    const orderKey = invoice ? `${platform}|${invoice.toLocaleLowerCase("id-ID").trim()}` : null;
    const itemSignature = orderKey
      ? [orderKey, product, qty ?? "", unitPrice ?? "", itemSubtotal ?? ""].map((part) => String(part).toLocaleLowerCase("id-ID").trim()).join("|")
      : null;
    if (itemSignature && seen.has(itemSignature) && status !== "error") {
      status = "duplicate";
      notes.push("Baris produk yang sama terulang di file dan tidak akan ditambahkan lagi.");
    }
    if (itemSignature) seen.add(itemSignature);

    const trackingNumber = field(raw, mappedHeaders.trackingNumber);
    const email = field(raw, mappedHeaders.email);
    const orderStatus = field(raw, mappedHeaders.orderStatus);
    const customerType = field(raw, mappedHeaders.customerType);
    const paymentMethod = field(raw, mappedHeaders.paymentMethod);
    const paymentStatus = field(raw, mappedHeaders.paymentStatus);
    const courier = field(raw, mappedHeaders.courier);
    const city = field(raw, mappedHeaders.city);
    const province = field(raw, mappedHeaders.province);
    const address = field(raw, mappedHeaders.address);
    const roundedTotal = total === null ? null : Math.round(total);
    const roundedSubtotal = itemSubtotal === null
      ? (unitPrice !== null && qty ? Math.round(unitPrice * qty) : roundedTotal)
      : Math.round(itemSubtotal);
    const roundedUnitPrice = unitPrice === null
      ? (qty && roundedSubtotal !== null ? Math.round(roundedSubtotal / qty) : null)
      : Math.round(unitPrice);
    const display = {
      "Tanggal Pesanan": orderDate ?? (orderDateRaw || "-"),
      Platform: PLATFORM_LABEL[platform],
      Toko: storeName,
      "No Invoice": invoice || "-",
      "No Resi": trackingNumber || "-",
      Customer: customer || "-",
      "No HP": phoneRaw || "-",
      Email: email || "-",
      Produk: product || "-",
      Qty: qty,
      "Harga Produk": roundedUnitPrice,
      "Subtotal Produk": roundedSubtotal,
      "Total Bayar": roundedTotal,
      "Status Pesanan": orderStatus || "-",
      "Status Pembayaran": paymentStatus || "-",
      "Metode Bayar": paymentMethod || "-",
      Ekspedisi: courier || "-",
      "Kota/Kabupaten": city || "-",
      Provinsi: province || "-",
      "Tipe Pelanggan": customerType || "-",
    };
    return {
      rowNumber: index + 1,
      raw,
      parsed: {
        orderDate,
        invoice,
        trackingNumber,
        customer,
        phone: phoneRaw || null,
        phoneNormalized,
        email: email || null,
        product,
        productId: null,
        qty,
        unitPrice: roundedUnitPrice,
        itemSubtotal: roundedSubtotal,
        total: roundedTotal,
        orderStatus: orderStatus || null,
        paymentStatus: paymentStatus || null,
        customerType: customerType || null,
        paymentMethod: paymentMethod || null,
        courier: courier || null,
        city: city || null,
        province: province || null,
        address: address || null,
      },
      display,
      status,
      notes,
      duplicateKey: itemSignature,
      targetEntity: "orders",
    };
  });
  return finalizeFile(headers, parsedRows, fileErrors);
}
