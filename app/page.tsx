"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap, Sparkles, Loader2 } from "lucide-react";
import { PricingSection } from "@/components/pricing-section";

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
      } else {
        supabase.auth.signInAnonymously().then(({ data: anonData }) => {
          if (anonData.user) {
            setUser(anonData.user);
          }
        }).catch((err) => {
          console.warn("Auto anonymous login failed:", err);
        });
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
        <Link href="/" className="flex items-center select-none">
          <img src="/logo.png" alt="Textipe Logo" className="h-7 w-auto" />
        </Link>
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
      <PricingSection onLoginRequired={() => setIsLoginOpen(true)} />

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/30">
            © 2025 Textipe · Built for educators
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
