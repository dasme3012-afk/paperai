"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap, Sparkles, Loader2, Menu, X } from "lucide-react";
import { PricingSection } from "@/components/pricing-section";

import { HomeUploadZone } from "@/components/home-upload-zone";
import { createBrowserClient } from "@/lib/supabase/client";
import { LoginModal } from "@/components/login-modal";
import { toast } from "sonner";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    // Check for auth errors in URL
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get("error");
    if (errorMsg) {
      setTimeout(() => toast.error(`Auth Error: ${errorMsg}`), 100);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 relative">
        <div className="flex-1">
          <Link href="/" className="flex items-center select-none w-fit">
            <img src="/logo.png" alt="Textipe Logo" className="h-7 w-auto" />
          </Link>
        </div>
        
        {/* ── Middle Navigation Ribbon ── */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-semibold text-white/70">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <div className="relative group cursor-pointer py-2">
            <span className="flex items-center gap-1 hover:text-white transition-colors select-none">
              Tools
              <svg className="h-3 w-3 text-white/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 rounded-xl border border-white/10 bg-[#121220] p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link href="/tools/pdf-to-jpg" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">PDF to JPG</Link>
              <Link href="/tools/jpg-to-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">JPG to PDF</Link>
              <Link href="/tools/merge-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Merge PDF</Link>
              <Link href="/tools/split-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Split PDF</Link>
              <Link href="/tools/rotate-pdf" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Rotate PDF</Link>
              <div className="my-1 h-px bg-white/5" />
              <Link href="/tools/image-resizer" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Image Resizer</Link>
              <Link href="/tools/image-compressor" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Image Compressor</Link>
              <Link href="/tools/convert-to-jpg" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Convert to JPG</Link>
              <Link href="/tools/convert-from-jpg" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Convert from JPG</Link>
              <Link href="/tools/crop-image" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Crop Image</Link>
              <Link href="/tools/rotate-image" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Rotate Image</Link>
              <div className="my-1 h-px bg-white/5" />
              <Link href="/tools/word-counter" className="block rounded-lg px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5">Word Counter</Link>
            </div>
          </div>
          <a href="#how-to-use" className="hover:text-white transition-colors">How to use</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center justify-end gap-3 text-sm flex-1">
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

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer ml-1"
            title="Toggle Menu"
          >
            {showMobileNav ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown navigation portal */}
        {showMobileNav && (
          <div className="md:hidden border-b border-white/10 bg-[#0c0c16] px-5 py-3.5 space-y-3 font-semibold text-white/75 text-xs absolute w-full left-0 top-full z-[999] shadow-2xl flex flex-col">
            <Link href="/" onClick={() => setShowMobileNav(false)} className="hover:text-white py-1">Home</Link>
            <Link href="/tools" onClick={() => setShowMobileNav(false)} className="text-blue-400 py-1 flex items-center gap-1">Free Tools Portal 🚀</Link>
            <a href="#how-to-use" onClick={() => setShowMobileNav(false)} className="hover:text-white py-1">How to use</a>
            <a href="#pricing" onClick={() => setShowMobileNav(false)} className="hover:text-white py-1">Pricing</a>
          </div>
        )}
      </nav>

      {/* Login Popup Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-6">
          <Zap size={13} className="text-yellow-400" />
          AI Powered OCR
        </div>
        <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-4">
          Digitize text<br />
          <span className="bg-gradient-to-r from-brand via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            papers instantly
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-white/55 leading-relaxed mb-10">
          Upload handwritten or printed papers. AI extracts, formats, and delivers a clean editable document — ready to edit and export.
        </p>
      </section>

      {/* Upload + Inline Editor (Moved up for immediate access) */}
      <section className="mx-auto max-w-3xl px-5 pb-10">
        <HomeUploadZone />
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="mx-auto max-w-5xl px-5 pb-20 pt-10 border-t border-white/5 mt-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">How to Use Textipe</h2>
          <p className="text-white/60">Follow these simple steps to digitize your exam papers instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          {/* Video Placeholder */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <video 
              controls 
              className="h-full w-full object-cover"
              poster="/video-poster.jpg"
            >
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Overlay for missing video */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
              <p className="mt-4 font-semibold text-lg drop-shadow-md">Tutorial Video</p>
              <p className="text-sm text-white/80 drop-shadow-md">(Upload 'demo-video.mp4' to public folder)</p>
            </div>
          </div>

          {/* Written Instructions */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold border border-brand/30">1</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Upload your papers</h3>
                <p className="text-white/60 text-sm leading-relaxed">Drag and drop photos or PDF scans of your exam papers into the upload zone above. You can upload up to 25 files at once.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold border border-brand/30">2</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Click Generate</h3>
                <p className="text-white/60 text-sm leading-relaxed">Hit the "Generate Editable Paper" button. Our AI will analyze the images, extract the text, and recreate the exact formatting, including tables and questions.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold border border-brand/30">3</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Edit and Export</h3>
                <p className="text-white/60 text-sm leading-relaxed">Review the digitized paper in the built-in editor. Make any adjustments you need, then export directly to Microsoft Word (.docx) or print it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <div id="pricing">
        <PricingSection onLoginRequired={() => setIsLoginOpen(true)} />
      </div>

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
