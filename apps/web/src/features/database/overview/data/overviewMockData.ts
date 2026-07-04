import type { ChartPoint, DonutSegment, KpiItem, TableRow } from "../types/databaseOverview.types";

export const summaryKpis = [
  { label: "Total Sources", value: "8", detail: "Connected", tone: "blue" },
  { label: "Imported Rows", value: "62,418", detail: "Total rows", tone: "green" },
  { label: "Pending Validation", value: "1,284", detail: "Rows", tone: "amber" },
  { label: "Ready to Publish", value: "5", detail: "batches", tone: "red" },
] satisfies KpiItem[];

export const summaryBreakdown = [
  { label: "Unmapped Data", value: "13,138", detail: "22% of mapped scope", tone: "amber" },
  { label: "Duplicate Candidates", value: "316", detail: "Needs review", tone: "red" },
  { label: "Failed Imports", value: "2", detail: "Batches blocked", tone: "red" },
  { label: "Published Batches", value: "12", detail: "This month", tone: "green" },
] satisfies KpiItem[];

export const importedRowsTrend = [
  { label: "Mon", value: 8400 },
  { label: "Tue", value: 9200 },
  { label: "Wed", value: 8800 },
  { label: "Thu", value: 11400 },
  { label: "Fri", value: 12600 },
  { label: "Sat", value: 10200 },
  { label: "Sun", value: 11818 },
] satisfies ChartPoint[];

export const summaryNotes = [
  "Gudang Makassar masih memiliki invalid rows tertinggi karena field SKU kosong.",
  "5 batch sudah memenuhi skor publish readiness di atas 90%.",
  "Mapping payment dan courier menjadi prioritas penyelesaian minggu ini.",
];

export const sourceRows = [
  { sourceName: "Database All Perusahaan", sourceType: "Master Data", totalRows: "18,420", lastImport: "04 Jul 2026 08:10", validRows: "17,982", invalidRows: "438", mappingProgress: 92, status: "Healthy", action: "Review" },
  { sourceName: "Database Produk Probetes", sourceType: "Product", totalRows: "9,840", lastImport: "04 Jul 2026 07:42", validRows: "9,602", invalidRows: "238", mappingProgress: 88, status: "Healthy", action: "Open" },
  { sourceName: "CRM / Cohort", sourceType: "Customer", totalRows: "7,635", lastImport: "03 Jul 2026 22:15", validRows: "7,402", invalidRows: "233", mappingProgress: 81, status: "Needs Review", action: "Fix" },
  { sourceName: "Laporan Karyawan", sourceType: "HR", totalRows: "1,286", lastImport: "03 Jul 2026 17:30", validRows: "1,266", invalidRows: "20", mappingProgress: 97, status: "Healthy", action: "Open" },
  { sourceName: "Gudang Jakarta", sourceType: "Warehouse", totalRows: "8,904", lastImport: "04 Jul 2026 05:50", validRows: "8,312", invalidRows: "592", mappingProgress: 74, status: "Watch", action: "Review" },
  { sourceName: "Gudang Makassar", sourceType: "Warehouse", totalRows: "6,552", lastImport: "04 Jul 2026 05:44", validRows: "5,814", invalidRows: "738", mappingProgress: 69, status: "Blocked", action: "Fix" },
  { sourceName: "Everpro Order Report", sourceType: "Order", totalRows: "5,931", lastImport: "04 Jul 2026 06:22", validRows: "5,720", invalidRows: "211", mappingProgress: 83, status: "Healthy", action: "Open" },
  { sourceName: "Marketplace CSV/XLSX", sourceType: "Sales Channel", totalRows: "3,850", lastImport: "03 Jul 2026 19:08", validRows: "3,752", invalidRows: "98", mappingProgress: 79, status: "Needs Review", action: "Map" },
];

export const sourceDistribution = [
  { label: "Master/Product", value: 28260, color: "#e30613" },
  { label: "Warehouse", value: 15456, color: "#0f172a" },
  { label: "Customer/Order", value: 13566, color: "#2563eb" },
  { label: "HR/Channel", value: 5136, color: "#f59e0b" },
] satisfies DonutSegment[];

export const pipelineStages = [
  { label: "Raw", value: "62,418 rows", number: 62418 },
  { label: "Validation", value: "61,134 rows", number: 61134 },
  { label: "Mapping", value: "59,876 rows", number: 59876 },
  { label: "Ready to Publish", value: "5 batches", number: 50000 },
  { label: "Published", value: "12 batches", number: 47000 },
];

export const funnelRows = [
  { stage: "Raw → Validation", conversion: "97.9%", dropped: "1,284 rows", status: "Stable" },
  { stage: "Validation → Mapping", conversion: "97.9%", dropped: "1,258 rows", status: "Watch" },
  { stage: "Mapping → Ready", conversion: "83.5%", dropped: "9,876 rows", status: "Bottleneck" },
  { stage: "Ready → Published", conversion: "94.0%", dropped: "3 review items", status: "Stable" },
];

export const pipelineBottlenecks = ["SKU kosong dari Gudang Makassar", "Payment method belum seragam", "Customer duplicate candidate belum diputuskan"];
export const pipelineRecommendations = ["Selesaikan courier mapping untuk marketplace", "Prioritaskan batch DBP-240704-003", "Review 42 problem queue sebelum publish sore ini"];

export const qualityMetrics = [
  { label: "Overall Quality Score", value: "87.4%", detail: "Good", tone: "green" },
  { label: "Completeness", value: "91%", detail: "Required fields", tone: "green" },
  { label: "Accuracy", value: "88%", detail: "Rule match", tone: "blue" },
  { label: "Consistency", value: "84%", detail: "Cross-source", tone: "amber" },
  { label: "Validity", value: "92%", detail: "Schema valid", tone: "green" },
  { label: "Duplicate Rate", value: "1.8%", detail: "Low risk", tone: "blue" },
  { label: "Mapping Coverage", value: "78%", detail: "Needs work", tone: "amber" },
] satisfies KpiItem[];

export const qualityTrend = [
  { label: "W1", value: 79 },
  { label: "W2", value: 82 },
  { label: "W3", value: 84 },
  { label: "W4", value: 87 },
  { label: "Now", value: 87.4 },
] satisfies ChartPoint[];

export const qualityIssues = [
  { label: "Missing Fields", value: 482, color: "#e30613" },
  { label: "Invalid Format", value: 336, color: "#f59e0b" },
  { label: "Duplicate", value: 316, color: "#2563eb" },
  { label: "Unmapped", value: 150, color: "#0f172a" },
] satisfies DonutSegment[];

export const qualityInsights = ["Completeness naik 4% setelah template import marketplace dirapikan.", "Duplicate customer paling banyak muncul dari CRM / Cohort.", "Mapping coverage harus melewati 85% sebelum publish massal."];

export const validationSummary = [
  { label: "Critical", value: "128", detail: "Blocks publish", tone: "red" },
  { label: "Warning", value: "742", detail: "Needs review", tone: "amber" },
  { label: "Info", value: "414", detail: "Low impact", tone: "blue" },
  { label: "Resolved", value: "2,906", detail: "This month", tone: "green" },
] satisfies KpiItem[];

export const validationIssues = [
  { issueType: "Missing SKU", source: "Gudang Makassar", batchId: "DBP-240704-003", rowsAffected: 438, severity: "Critical", lastDetected: "04 Jul 08:11", owner: "Data Ops", status: "Open" },
  { issueType: "Invalid phone format", source: "CRM / Cohort", batchId: "CRM-240703-009", rowsAffected: 206, severity: "Warning", lastDetected: "03 Jul 22:20", owner: "CRM Team", status: "Assigned" },
  { issueType: "Duplicate customer", source: "Marketplace CSV/XLSX", batchId: "MKT-240703-004", rowsAffected: 316, severity: "Warning", lastDetected: "03 Jul 19:18", owner: "Sales Ops", status: "Review" },
  { issueType: "Unknown courier code", source: "Everpro Order Report", batchId: "EVP-240704-001", rowsAffected: 91, severity: "Info", lastDetected: "04 Jul 06:26", owner: "Logistics", status: "Open" },
] satisfies TableRow[];

export const issueSeverityDonut = [
  { label: "Critical", value: 128, color: "#e30613" },
  { label: "Warning", value: 742, color: "#f59e0b" },
  { label: "Info", value: 414, color: "#2563eb" },
] satisfies DonutSegment[];

export const validationActions = ["Data Ops assigned SKU fix to warehouse admin.", "CRM phone normalizer approved for next import.", "316 duplicate candidates moved to Problem Queue."];

export const mappingCategories = [
  { kategori: "Product Mapping", progress: 84, mapped: "8,265", unmapped: "1,575", status: "On Track", updated: "04 Jul 08:20" },
  { kategori: "Customer Matching", progress: 76, mapped: "5,803", unmapped: "1,832", status: "Watch", updated: "04 Jul 07:45" },
  { kategori: "Channel Mapping", progress: 82, mapped: "3,157", unmapped: "693", status: "On Track", updated: "03 Jul 19:30" },
  { kategori: "Platform Mapping", progress: 88, mapped: "3,388", unmapped: "462", status: "On Track", updated: "03 Jul 19:25" },
  { kategori: "Payment Method Mapping", progress: 71, mapped: "2,734", unmapped: "1,116", status: "Needs Review", updated: "04 Jul 06:55" },
  { kategori: "Courier Mapping", progress: 69, mapped: "2,657", unmapped: "1,193", status: "Blocked", updated: "04 Jul 06:50" },
  { kategori: "Warehouse Mapping", progress: 93, mapped: "14,374", unmapped: "1,082", status: "On Track", updated: "04 Jul 05:55" },
  { kategori: "Tracking Status Mapping", progress: 78, mapped: "3,003", unmapped: "847", status: "Watch", updated: "04 Jul 06:40" },
];

export const unmappedValues = ["COD-BAYAR-DITEMPAT", "JNE_REG_NEW", "SKU-PROB-OLD-24", "WH-MKS-TEMP", "TikTok Shop ID legacy"];
export const mappingDecisions = ["Mapped Shopee COD to Payment Method: COD.", "Merged WH-JKT-01 and Gudang Jakarta Utama.", "Approved SKU alias PROBETES-BASIC-NEW."];

export const importKpis = [
  { label: "Total Batches", value: "24", detail: "Last 7 days", tone: "blue" },
  { label: "Successful Imports", value: "19", detail: "79% success", tone: "green" },
  { label: "Failed Imports", value: "2", detail: "Need retry", tone: "red" },
  { label: "In Progress", value: "3", detail: "Running", tone: "amber" },
] satisfies KpiItem[];

export const importBatches = [
  { batchId: "DBP-240704-003", source: "Gudang Makassar", importedBy: "Ayu", importedAt: "04 Jul 08:05", rows: "6,552", valid: "5,814", invalid: "738", duration: "2m 41s", status: "Failed" },
  { batchId: "DBP-240704-002", source: "Database Produk Probetes", importedBy: "Raka", importedAt: "04 Jul 07:40", rows: "9,840", valid: "9,602", invalid: "238", duration: "3m 12s", status: "Success" },
  { batchId: "EVP-240704-001", source: "Everpro Order Report", importedBy: "Nadia", importedAt: "04 Jul 06:20", rows: "5,931", valid: "5,720", invalid: "211", duration: "1m 48s", status: "Success" },
  { batchId: "WHJ-240704-001", source: "Gudang Jakarta", importedBy: "Bima", importedAt: "04 Jul 05:48", rows: "8,904", valid: "8,312", invalid: "592", duration: "2m 33s", status: "Review" },
] satisfies TableRow[];

export const importActivity = [
  { label: "00", value: 2 },
  { label: "04", value: 5 },
  { label: "08", value: 9 },
  { label: "12", value: 4 },
  { label: "16", value: 3 },
  { label: "20", value: 6 },
] satisfies ChartPoint[];

export const activeSources = ["Database Produk Probetes", "Gudang Jakarta", "Gudang Makassar", "Everpro Order Report"];

export const problemKpis = [
  { label: "Open Problems", value: "42", detail: "In queue", tone: "amber" },
  { label: "Critical Problems", value: "7", detail: "Blocks publish", tone: "red" },
  { label: "Assigned Today", value: "18", detail: "In progress", tone: "blue" },
  { label: "Overdue", value: "5", detail: "Past SLA", tone: "red" },
] satisfies KpiItem[];

export const problemRows = [
  { problem: "SKU missing for Makassar inventory", category: "Completeness", source: "Gudang Makassar", impactedRows: 438, priority: "Critical", assignee: "Data Ops", dueDate: "04 Jul", status: "Open", action: "Fix" },
  { problem: "Courier legacy code not mapped", category: "Mapping", source: "Everpro Order Report", impactedRows: 91, priority: "High", assignee: "Logistics", dueDate: "04 Jul", status: "Assigned", action: "Map" },
  { problem: "Duplicate CRM customers", category: "Duplicate", source: "CRM / Cohort", impactedRows: 316, priority: "High", assignee: "CRM Team", dueDate: "05 Jul", status: "Review", action: "Review" },
  { problem: "Payment method alias unclear", category: "Mapping", source: "Marketplace CSV/XLSX", impactedRows: 184, priority: "Medium", assignee: "Sales Ops", dueDate: "05 Jul", status: "Open", action: "Decide" },
] satisfies TableRow[];

export const problemCategories = [
  { label: "Mapping", value: 18, color: "#e30613" },
  { label: "Completeness", value: 11, color: "#f59e0b" },
  { label: "Duplicate", value: 8, color: "#2563eb" },
  { label: "Format", value: 5, color: "#0f172a" },
] satisfies DonutSegment[];

export const priorityFocus = ["Close 7 critical blockers before publish window.", "Assign overdue problems to owner with SLA today.", "Batch DBP-240704-003 needs warehouse confirmation."];

export const publishKpis = [
  { label: "Ready Batches", value: "5", detail: "Can publish", tone: "green" },
  { label: "Needs Review", value: "8", detail: "Pending owner", tone: "amber" },
  { label: "Blocked Batches", value: "3", detail: "Critical issue", tone: "red" },
  { label: "Published Today", value: "4", detail: "ERP main", tone: "blue" },
] satisfies KpiItem[];

export const publishCandidates = [
  { batchId: "DBP-240704-002", source: "Database Produk Probetes", validRows: "9,602", mappingCoverage: "88%", validationStatus: "Passed", ownerApproval: "Approved", readyScore: "94", action: "Publish" },
  { batchId: "EVP-240704-001", source: "Everpro Order Report", validRows: "5,720", mappingCoverage: "83%", validationStatus: "Passed", ownerApproval: "Approved", readyScore: "91", action: "Publish" },
  { batchId: "WHJ-240704-001", source: "Gudang Jakarta", validRows: "8,312", mappingCoverage: "74%", validationStatus: "Warning", ownerApproval: "Pending", readyScore: "76", action: "Review" },
  { batchId: "DBP-240704-003", source: "Gudang Makassar", validRows: "5,814", mappingCoverage: "69%", validationStatus: "Blocked", ownerApproval: "Rejected", readyScore: "54", action: "Fix" },
] satisfies TableRow[];

export const publishChecklist = ["Validation critical = 0", "Mapping coverage ≥ 85%", "Owner approval completed", "Rollback batch snapshot created", "Audit note attached"];
export const readyBlocked = [
  { label: "Ready", value: 5, color: "#16a34a" },
  { label: "Review", value: 8, color: "#f59e0b" },
  { label: "Blocked", value: 3, color: "#e30613" },
] satisfies DonutSegment[];

export const auditKpis = [
  { label: "Total Activities", value: "1,842", detail: "30 days", tone: "blue" },
  { label: "Imports Logged", value: "318", detail: "Batches", tone: "green" },
  { label: "Mapping Actions", value: "927", detail: "Decisions", tone: "amber" },
  { label: "Publish Actions", value: "42", detail: "ERP main", tone: "red" },
  { label: "Error Events", value: "96", detail: "Investigated", tone: "slate" },
] satisfies KpiItem[];

export const activityRows = [
  { timestamp: "04 Jul 08:24", user: "Raka", activityType: "Mapping", module: "Mapping Center", target: "Payment Method", description: "Mapped Shopee COD alias", impact: "184 rows", status: "Success" },
  { timestamp: "04 Jul 08:12", user: "Ayu", activityType: "Import", module: "Import Center", target: "DBP-240704-003", description: "Imported Gudang Makassar batch", impact: "6,552 rows", status: "Failed" },
  { timestamp: "04 Jul 07:52", user: "Nadia", activityType: "Validation", module: "Validation Issues", target: "CRM phone", description: "Assigned phone format issue", impact: "206 rows", status: "Assigned" },
  { timestamp: "03 Jul 21:10", user: "Admin", activityType: "Publish", module: "Publish Center", target: "EVP-240703-006", description: "Published valid Everpro batch", impact: "4,912 rows", status: "Success" },
] satisfies TableRow[];

export const activityDistribution = [
  { label: "Import", value: 318, color: "#2563eb" },
  { label: "Mapping", value: 927, color: "#e30613" },
  { label: "Publish", value: 42, color: "#16a34a" },
  { label: "Error", value: 96, color: "#f59e0b" },
] satisfies DonutSegment[];

export const recentApprovals = ["Owner approved DBP-240704-002 for publish.", "Sales Ops approved marketplace payment alias.", "Logistics rejected courier legacy mapping pending evidence."];
