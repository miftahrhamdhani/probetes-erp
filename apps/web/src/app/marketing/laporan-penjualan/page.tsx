import { redirect } from "next/navigation";

// "Laporan Penjualan & Pesanan" sudah digantikan oleh Sales & Order Center
// (lihat /marketing/sales-order beserta 6 sub-halamannya). Route lama tetap ada
// sebagai redirect supaya tautan/bookmark lama tidak mati.
export default function LaporanPenjualanRedirect() {
  redirect("/marketing/sales-order");
}
