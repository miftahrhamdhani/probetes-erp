import type { MasterDataSectionId } from "../types/masterData.types";
import { ChannelSection } from "./sections/ChannelSection";
import { CohortSection } from "./sections/CohortSection";
import { CsTimSection } from "./sections/CsTimSection";
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
    case "cs-tim":
      return <CsTimSection />;
    case "ekspedisi":
      return <EkspedisiSection />;
    case "pelanggan":
    default:
      return <PelangganSection />;
  }
}
