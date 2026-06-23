import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#101113] dark:text-paper">
      <AppHeader />
      <DashboardClient />
    </main>
  );
}
