import { redirect } from "next/navigation";

// Menu "Gudang" kini bernama "Warehouse / Gudang" di /warehouse. Redirect agar
// link/bookmark lama ke /gudang tidak menghasilkan halaman 404.
export default function GudangPage() {
  redirect("/warehouse");
}
