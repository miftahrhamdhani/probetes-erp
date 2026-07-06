import type { MasterDataMenu } from "../types/masterData.types";

export const masterDataMenus = [
  { id: "pelanggan", title: "Pelanggan", badge: "21.603", icon: "users" },
  { id: "cohort", title: "Database Cohort", badge: "20.332", icon: "history" },
  { id: "produk", title: "Produk", badge: "94", icon: "package" },
  { id: "channel", title: "Channel", badge: "5", icon: "globe" },
  { id: "cs-tim", title: "CS / Tim", badge: "62", icon: "headphones" },
  { id: "ekspedisi", title: "Ekspedisi", badge: "22", icon: "truck" },
] satisfies MasterDataMenu[];
