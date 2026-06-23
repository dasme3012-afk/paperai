"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react";

const HomeUploadZone = dynamic(() => import("@/components/home-upload-zone").then(m => m.HomeUploadZone), {
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/5">
      <Loader2 className="animate-spin text-brand" size={32} />
    </div>
  ),
  ssr: false, // Heavy client-side component (pdfjs, tiptap)
});
import { createBrowserClient } from "@/lib/supabase/client";
import { LoginModal } from "@/components/login-modal";
import { toast } from "sonner";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
      }
    });
  }, []);

  async function handleLogout() {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">PaperAI</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md bg-white/10 border border-white/15 px-4 py-2 font-semibold hover:bg-white/15 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md px-4 py-2 font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="rounded-md px-4 py-2 font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="rounded-md bg-white/10 border border-white/15 px-4 py-2 font-semibold hover:bg-white/15 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login Popup Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-6">
          <Zap size={13} className="text-yellow-400" />
          AI-powered OCR · Gemini 2.5 Pro
        </div>
        <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-4">
          Digitize question<br />
          <span className="bg-gradient-to-r from-brand via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            papers instantly
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-white/55 leading-relaxed mb-10">
          Upload handwritten or printed exam papers. AI extracts, formats, and delivers a clean editable document — ready to edit and export.
        </p>
      </section>

      {/* Upload + Inline Editor */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <HomeUploadZone />
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">Simple pricing</h2>
          <p className="text-white/55">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {/* Free */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap size={16} className="text-white/70" />
              </div>
              <span className="font-black text-lg">Free</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-black">₹0</span>
              <span className="text-white/40 text-sm ml-1">/month</span>
            </div>
            <p className="text-white/50 text-sm mb-6">Perfect for occasional use</p>
            <ul className="space-y-3 mb-8">
              {[
                "5 images per 24 hours",
                "Up to 25 images per upload",
                "PDF & DOCX export",
                "AI OCR formatting",
                "Multilingual support"
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check size={15} className="text-brand mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="block w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-center text-sm font-bold hover:bg-white/10 transition-colors">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-brand/50 bg-brand/5 p-7 ring-1 ring-brand/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-black text-white">MOST POPULAR</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-brand/20 flex items-center justify-center">
                <Crown size={16} className="text-brand" />
              </div>
              <span className="font-black text-lg">Pro</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-black">₹299</span>
              <span className="text-white/40 text-sm ml-1">/month</span>
            </div>
            <p className="text-white/50 text-sm mb-6">For teachers & coaching centres</p>
            <ul className="space-y-3 mb-8">
              {[
                "100 images per 24 hours",
                "Up to 25 images per upload",
                "PDF & DOCX export",
                "Priority AI processing",
                "Multilingual support",
                "Project history"
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check size={15} className="text-brand mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="block w-full rounded-xl bg-brand py-2.5 text-center text-sm font-black text-white hover:bg-brand/90 transition-colors">
              Upgrade to Pro
            </Link>
          </div>

          {/* Ultra */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center">
                <Sparkles size={16} className="text-yellow-400" />
              </div>
              <span className="font-black text-lg">Ultra</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-black">₹799</span>
              <span className="text-white/40 text-sm ml-1">/month</span>
            </div>
            <p className="text-white/50 text-sm mb-6">For large institutions</p>
            <ul className="space-y-3 mb-8">
              {[
                "250 images per 24 hours",
                "Up to 25 images per upload",
                "PDF & DOCX export",
                "Highest priority processing",
                "Multilingual support",
                "Project history",
                "Team collaboration",
                "API access"
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="block w-full rounded-xl border border-yellow-400/30 bg-yellow-400/5 py-2.5 text-center text-sm font-bold text-yellow-400 hover:bg-yellow-400/10 transition-colors">
              Upgrade to Ultra
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-white/30 mt-8">
          All plans: max 25 images per upload session · Images, PDFs & Office files only
        </p>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/30">
            © 2025 PaperAI · Built for educators
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
