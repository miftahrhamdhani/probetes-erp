export type Sheet = {
  name: string;
  rows: Record<string, unknown>[];
  subtitle?: string;
};

function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[\\/?*\[\]:]/g, " ").trim().slice(0, 31) || "Sheet";
  let finalName = base;
  let i = 2;
  while (used.has(finalName)) {
    finalName = `${base.slice(0, 28)} ${i}`.slice(0, 31);
    i += 1;
  }
  used.add(finalName);
  return finalName;
}

function valueType(value: unknown): "Number" | "String" {
  return typeof value === "number" && Number.isFinite(value) ? "Number" : "String";
}

function cell(value: unknown, style = "Data"): string {
  return `<Cell ss:StyleID="${style}"><Data ss:Type="${valueType(value)}">${escapeXml(value)}</Data></Cell>`;
}

function row(values: unknown[], style = "Data", height?: number): string {
  return `<Row${height ? ` ss:Height="${height}"` : ""}>${values.map((value) => cell(value, style)).join("")}</Row>`;
}

function worksheet(sheet: Sheet, title: string, createdAt: string, used: Set<string>): string {
  const name = safeSheetName(sheet.name, used);
  const columns = sheet.rows[0] ? Object.keys(sheet.rows[0]) : ["Catatan"];
  const dataRows: Record<string, unknown>[] = sheet.rows.length
    ? sheet.rows
    : [{ Catatan: "Tidak ada data pada sheet ini." }];
  const columnXml = columns
    .map((col) => {
      const width = Math.min(
        220,
        Math.max(80, (col.length + 2) * 7, ...dataRows.slice(0, 100).map((r) => String(r[col] ?? "").length * 7)),
      );
      return `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`;
    })
    .join("");
  const meta = `${sheet.name}${sheet.subtitle ? ` — ${sheet.subtitle}` : ""} | Dibuat: ${createdAt}`;

  return `<Worksheet ss:Name="${escapeXml(name)}">
    <Table>
      ${columnXml}
      ${row(["PROBETES ERP"], "Brand", 28)}
      ${row([title], "Title", 24)}
      ${row([meta], "Meta", 20)}
      ${row(columns, "Header", 22)}
      ${dataRows.map((r) => row(columns.map((col) => r[col]), "Data")).join("")}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>4</SplitHorizontal>
      <TopRowBottomPane>4</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>`;
}

/**
 * Susun workbook Excel dalam format SpreadsheetML (XML) — disimpan sebagai .xls.
 * Excel bisa membukanya langsung, tapi menampilkan peringatan format/ekstensi
 * (wajar untuk format ini; tidak merusak data). Dipilih agar tidak perlu
 * menambah library xlsx eksternal.
 */
export function workbookToExcelXml(sheets: Sheet[], title: string): Buffer {
  const used = new Set<string>();
  const createdAt = new Date().toLocaleString("id-ID");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Brand">
      <Font ss:Bold="1" ss:Size="18" ss:Color="#E30613"/>
    </Style>
    <Style ss:ID="Title">
      <Interior ss:Color="#FFE8EA" ss:Pattern="Solid"/>
      <Font ss:Bold="1" ss:Size="14" ss:Color="#0F172A"/>
    </Style>
    <Style ss:ID="Meta">
      <Font ss:Size="10" ss:Color="#475569"/>
    </Style>
    <Style ss:ID="Header">
      <Interior ss:Color="#E30613" ss:Pattern="Solid"/>
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="Data">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
  </Styles>
  ${sheets.map((sheet) => worksheet(sheet, title, createdAt, used)).join("")}
</Workbook>`;
  return Buffer.from(xml, "utf-8");
}
