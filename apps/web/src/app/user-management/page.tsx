import {
  History,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "akun-login", title: "Akun Login", description: "Kelola daftar akun login pengguna aplikasi ERP.", href: "/user-management/akun-login", icon: Users },
  { id: "role", title: "Role", description: "Daftar role Owner, Admin, Marketing, CS, CRM, ADV, Finance, Gudang, HRD.", href: "/user-management/role", icon: UserCog },
  { id: "permission", title: "Permission", description: "Kode permission, modul, aksi, dan deskripsi.", href: "/user-management/permission", icon: ShieldCheck },
  { id: "role-permission", title: "Role Permission", description: "Permission yang dimiliki tiap role.", href: "/user-management/role-permission", icon: ShieldCheck },
  { id: "account-role", title: "Account Role", description: "Riwayat pemberian role ke akun pengguna.", href: "/user-management/account-role", icon: KeyRound },
  { id: "activity-log", title: "Activity Log", description: "Pantau riwayat aktivitas penting pengguna di aplikasi.", href: "/user-management/activity-log", icon: History },
];

export default function UserManagementPage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="USER MANAGEMENT MODULE"
        titlePrefix="User"
        titleHighlight="Management"
        description="Kelola akun login, role, hak akses, dan aktivitas pengguna aplikasi ERP."
        monogram="U"
        highlights={[
          { icon: KeyRound, title: "Akun Terkontrol", detail: "Login & keamanan" },
          { icon: UserCog, title: "Role Jelas", detail: "9 role operasional" },
          { icon: History, title: "Audit Aktivitas", detail: "Jejak perubahan" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu User Management</h2>
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
