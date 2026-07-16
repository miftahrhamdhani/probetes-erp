import type { MasterDataSectionId } from "../types/masterData.types";
import { ChannelSection } from "./sections/ChannelSection";
import { CohortSection } from "./sections/CohortSection";
import { KaryawanSection } from "./sections/KaryawanSection";
import { EkspedisiSection } from "./sections/EkspedisiSection";
import { PelangganSection } from "./sections/PelangganSection";
import { ProdukSection } from "./sections/ProdukSection";

export function MasterDataContent({ activeId }: { activeId: MasterDataSectionId }) {
  switch (activeId) {
    case "cohort":
      return <CohortSection />;
    case "produk":
      return <ProdukSection />;
    case "channel":
      return <ChannelSection />;
    case "karyawan":
      return <KaryawanSection />;
    case "ekspedisi":
      return <EkspedisiSection />;
    case "pelanggan":
    default:
      return <PelangganSection />;
  }
}
