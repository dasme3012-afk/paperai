"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#101113]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-sm font-bold text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-line dark:bg-white/10" />
          <Link href="/" className="flex items-center select-none">
            <img src="/logo.png" alt="Textipe Logo" className="h-7 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden sm:inline-block rounded-md border border-line px-4 py-2 text-sm font-bold hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5 transition-colors">Dashboard</Link>
          <Link href="/projects/new" className="rounded-md bg-brand px-4 py-2 text-sm font-bold text-white hover:brightness-110 transition-all">New</Link>
          <Link href="/profile" className="grid h-11 w-11 place-items-center rounded-md border border-line bg-white hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors" aria-label="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
