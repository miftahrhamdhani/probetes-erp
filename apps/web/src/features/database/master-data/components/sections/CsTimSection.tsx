"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { TablePagination } from "../TablePagination";

interface UserRow {
  id: string;
  name: string;
  role: string;
  divisi: string;
  orders: number;
  status: string;
}

interface SumberLainRow {
  name: string;
  jenis: string;
  orders: number;
}

const kpiItems = [
  { label: "User Aktif", value: "62", detail: "Nama orang", tone: "green" as const },
  { label: "Order Tertaut CS", value: "39.085", detail: "Terhubung", tone: "blue" as const },
  { label: "Bukan Nama Orang", value: "32", detail: "Dipisah", tone: "amber" as const },
  { label: "Nama Mirip", value: "8", detail: "Perlu dicek", tone: "slate" as const },
];

const jenisTone: Record<string, StatusTone> = {
  "Toko/Brand": "blue",
  Kategori: "purple",
  Penanda: "slate",
  Sumber: "amber",
  Mitra: "green",
  "Salah Input": "red",
};

const notes = [
  "Perbedaan huruf besar/kecil sudah digabung — WAHYU dan Wahyu dihitung satu orang.",
  "Nama mirip (FIA/FIAN, Elin/Erlin, Anggi/Anggit) masih dipisah, menunggu konfirmasi apakah orang yang sama.",
  "Nama toko, affiliate, dan penanda dikeluarkan dari daftar tim sesuai keputusan owner.",
];

export function CsTimSection() {
  const users = usePagedData<UserRow>("/data/users.json");
  const sumberLain = usePagedData<SumberLainRow>("/data/sumber_lain.json");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar CS / Tim" subtitle="Seluruh user internal yang menangani pelanggan dan order.">
        {users.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {users.error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!users.loading && !users.error && (
          <>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Role</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Divisi</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.role}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.divisi}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
                      <td className="py-3 text-right">
                        <StatusBadge label={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={users.page}
              totalPages={users.totalPages}
              pageSize={users.pageSize}
              total={users.total}
              onPage={users.setPage}
              onPageSize={users.setPageSize}
            />
          </>
        )}
      </DataPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Bukan Nama Orang" subtitle="Dipisah dari daftar tim (toko, affiliate, penanda, salah input).">
          {sumberLain.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
          {sumberLain.error && (
            <p className="py-8 text-center text-sm font-medium text-amber-600">
              Data belum tersedia. Jalankan export data terlebih dahulu.
            </p>
          )}
          {!sumberLain.loading && !sumberLain.error && (
            <>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jenis</th>
                      <th className="pb-3 text-right font-bold text-slate-500">Pesanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sumberLain.rows.map((row) => (
                      <tr key={row.name}>
                        <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={row.jenis} tone={jenisTone[row.jenis]} />
                        </td>
                        <td className="py-3 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={sumberLain.page}
                totalPages={sumberLain.totalPages}
                pageSize={sumberLain.pageSize}
                total={sumberLain.total}
                onPage={sumberLain.setPage}
                onPageSize={sumberLain.setPageSize}
              />
            </>
          )}
        </DataPanel>

        <DataPanel title="Catatan CS / Tim">
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                {note}
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </div>
  );
}
