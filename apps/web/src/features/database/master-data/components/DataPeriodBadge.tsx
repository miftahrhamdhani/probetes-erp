"use client";

import { useEffect, useState } from "react";
import { CalendarRange } from "lucide-react";
import { formatTanggalId } from "../lib/format";

interface PeriodResponse {
  earliest: string | null;
  latest: string | null;
}

/** Menampilkan rentang tanggal data ASLI (dari database), agar terlihat data mencakup periode kapan. */
export function DataPeriodBadge() {
  const [period, setPeriod] = useState<PeriodResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/master/period")
      .then((res) => (res.ok ? (res.json() as Promise<PeriodResponse>) : null))
      .then((data) => {
        if (alive) setPeriod(data);
      })
      .catch(() => {
        if (alive) setPeriod(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!period?.earliest || !period.latest) return null;

  return (
    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      <CalendarRange className="size-3.5" />
      Data mencakup {formatTanggalId(period.earliest)} – {formatTanggalId(period.latest)}
    </span>
  );
}
