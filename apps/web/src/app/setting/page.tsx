import {
  Building2,
  Hash,
  HardDrive,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "pengaturan-umum", title: "Pengaturan Umum", description: "Nama setting, nilai, dan modul terkait.", href: "/setting/pengaturan-umum", icon: Building2 },
  { id: "penomoran-id", title: "Penomoran ID", description: "Atur format ID Customer, Order, Produk, dan lainnya.", href: "/setting/penomoran-id", icon: Hash },
  { id: "template-import", title: "Template Import", description: "Template format file & kolom wajib untuk import data.", href: "/setting/template-import", icon: UploadCloud },
  { id: "backup-cadangan", title: "Backup / Cadangan", description: "Pantau jadwal dan riwayat backup database.", href: "/setting/backup-cadangan", icon: HardDrive },
  { id: "security-setting", title: "Security Setting", description: "Aturan keamanan dan kebijakan akses.", href: "/setting/security-setting", icon: ShieldAlert },
];

export default function SettingPage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="SETTING MODULE"
        titlePrefix="Setting"
        titleHighlight="Sistem"
        description="Kelola pengaturan sistem, profil perusahaan, backup, format ID, dan konfigurasi aplikasi."
        monogram="S"
        highlights={[
          { icon: Building2, title: "Profil Perusahaan", detail: "Nama & logo" },
          { icon: Hash, title: "Format ID Rapi", detail: "Konsisten tiap entitas" },
          { icon: HardDrive, title: "Cadangan Aman", detail: "Backup terjadwal" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Setting</h2>
          <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
            Klik salah satu menu untuk membuka halaman kerja khusus submenu tersebut.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {menus.map((menu) => (
            <ModuleMenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      </div>
    </ModuleCenterShell>
  );
}
