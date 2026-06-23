import { AppHeader } from "@/components/app-header";
import { SetupStatusClient } from "@/components/setup-status-client";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#101113] dark:text-paper">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-black">Setup</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">Check whether the app is ready for auth, OCR, AI cleanup, and exports.</p>
        <div className="mt-6">
          <SetupStatusClient />
        </div>
      </div>
    </main>
  );
}
