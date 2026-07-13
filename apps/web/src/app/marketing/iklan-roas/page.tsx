import { redirect } from "next/navigation";

// Halaman Iklan & ROAS versi lama sudah digantikan oleh versi baru yang mengikuti
// mockup D:\PROBETES\mockup iklan & roas (lihat /marketing/ads-roas). Route lama tetap
// ada sebagai redirect supaya tautan/bookmark lama tidak mati.
export default function IklanRoasRedirect() {
  redirect("/marketing/ads-roas");
}
