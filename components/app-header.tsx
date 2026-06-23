import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#101113]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="text-xl font-black tracking-tight">PaperAI</Link>
        <div className="flex items-center gap-2">
          <Link href="/setup" className="rounded-md border border-line px-4 py-2 text-sm font-bold dark:border-white/10">Setup</Link>
          <Link href="/demo" className="rounded-md border border-line px-4 py-2 text-sm font-bold dark:border-white/10">Demo</Link>
          <Link href="/projects/new" className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-white">New</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
