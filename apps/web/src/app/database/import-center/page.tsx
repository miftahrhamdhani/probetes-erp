import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";

export default function DatabaseImportCenterPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex max-w-[1680px] flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Import Center</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Module under development.</p>
        </div>
        <DatabaseBackButton />
      </main>
    </div>
  );
}
