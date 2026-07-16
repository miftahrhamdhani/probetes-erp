import type { MasterDataMenu } from "../types/masterData.types";

// Badge (jumlah data) TIDAK ditulis di sini — diisi MasterDataPage dari
// /api/master/counts supaya angkanya selalu ikut database.
export const masterDataMenus = [
  { id: "pelanggan", title: "Pelanggan", icon: "users" },
  { id: "cohort", title: "Database Cohort", icon: "history" },
  { id: "produk", title: "Produk", icon: "package" },
  { id: "channel", title: "Channel/Mitra", icon: "globe" },
  { id: "karyawan", title: "Data Karyawan", icon: "headphones" },
  { id: "ekspedisi", title: "Ekspedisi", icon: "truck" },
] satisfies MasterDataMenu[];
