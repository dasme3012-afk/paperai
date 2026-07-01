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
        
        {/* ── Middle Navigation Ribbon ── */}
        <div className="hidden md:flex items-center justify-center gap-6 text-sm font-semibold text-black/60 dark:text-white/60">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <div className="relative group cursor-pointer py-2">
            <span className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors select-none">
              Tools
              <svg className="h-3 w-3 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-[#121220] p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/tools?tool=pdf-to-jpg" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">PDF to JPG</Link>
              <Link href="/tools?tool=jpg-to-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">JPG to PDF</Link>
              <Link href="/tools?tool=merge-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Merge PDF</Link>
              <Link href="/tools?tool=split-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Split PDF</Link>
              <Link href="/tools?tool=rotate-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Rotate PDF</Link>
              <div className="my-1 h-px bg-black/5 dark:bg-white/5" />
              <Link href="/tools?tool=image-resizer" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Image Resizer</Link>
              <Link href="/tools?tool=image-compressor" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Image Compressor</Link>
              <Link href="/tools?tool=image-converter" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Image Converter</Link>
              <Link href="/tools?tool=crop-image" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Crop Image</Link>
              <Link href="/tools?tool=rotate-image" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Rotate Image</Link>
              <div className="my-1 h-px bg-black/5 dark:bg-white/5" />
              <Link href="/tools?tool=word-counter" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5">Word Counter</Link>
            </div>
          </div>
          <Link href="/#how-to-use" className="hover:text-black dark:hover:text-white transition-colors">How to use</Link>
          <Link href="/#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
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
