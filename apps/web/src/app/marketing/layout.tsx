import type { ReactNode } from "react";
import { ImportHistoryProvider } from "@/features/marketing/context/ImportHistoryContext";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <ImportHistoryProvider>{children}</ImportHistoryProvider>;
}
