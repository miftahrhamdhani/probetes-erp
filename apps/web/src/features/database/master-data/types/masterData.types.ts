export type MasterDataSectionId =
  | "pelanggan"
  | "cohort"
  | "produk"
  | "channel"
  | "cs-tim"
  | "ekspedisi";

export type MasterDataIconKey =
  | "users"
  | "history"
  | "package"
  | "globe"
  | "headphones"
  | "truck";

export interface MasterDataMenu {
  id: MasterDataSectionId;
  title: string;
  badge?: string;
  icon: MasterDataIconKey;
}
