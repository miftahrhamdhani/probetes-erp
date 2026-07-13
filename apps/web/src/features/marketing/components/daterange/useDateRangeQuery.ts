"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRangePresetKey, DateRangeValue } from "./dateRange.types";
import { defaultDateRange, isValidIsoDate, resolvePreset } from "./dateRange.validation";

/**
 * Rentang tanggal tersimpan di URL query (start_date/end_date) supaya refresh halaman
 * dan drilldown/export tetap membaca tanggal yang sama. Default 30 hari terakhir.
 */
export function useDateRangeQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startParam = searchParams.get("start_date");
  const endParam = searchParams.get("end_date");

  const range: DateRangeValue = useMemo(() => {
    if (isValidIsoDate(startParam) && isValidIsoDate(endParam) && startParam <= endParam) {
      return { startDate: startParam, endDate: endParam };
    }
    return defaultDateRange();
  }, [startParam, endParam]);

  const setRange = useCallback((next: DateRangeValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start_date", next.startDate);
    params.set("end_date", next.endDate);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const setPreset = useCallback((preset: DateRangePresetKey) => {
    if (preset === "custom") return;
    setRange(resolvePreset(preset));
  }, [setRange]);

  const reset = useCallback(() => setRange(defaultDateRange()), [setRange]);

  return { range, setRange, setPreset, reset };
}
