import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | PaperAI",
  description: "Learn about the mission and technology behind PaperAI.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-brand/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight sm:text-4xl">About PaperAI</h1>
        <p className="text-white/60 mb-8 pb-8 border-b border-white/10">Empowering educators with AI.</p>
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/80 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80">
          <h2>Our Mission</h2>
          <p className="text-lg">We believe teachers should spend their time teaching, not typing.</p>
          <p>
            PaperAI was born out of a simple observation: educators worldwide spend countless hours manually retyping physical question papers, worksheets, and exams into digital formats. By combining cutting-edge Optical Character Recognition (OCR) with advanced Large Language Models (LLMs), PaperAI automates this tedious process, turning crumpled scans into perfect digital documents in seconds.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 not-prose my-10">
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              <Sparkles className="text-brand mb-3" size={24} />
              <h3 className="font-bold mb-2">Smart OCR</h3>
              <p className="text-sm text-white/60">Understands complex layouts, tables, and mixed content.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              <BookOpen className="text-brand mb-3" size={24} />
              <h3 className="font-bold mb-2">Education First</h3>
              <p className="text-sm text-white/60">Designed specifically for question papers and worksheets.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              <Layers className="text-brand mb-3" size={24} />
              <h3 className="font-bold mb-2">Seamless Export</h3>
              <p className="text-sm text-white/60">Export perfectly formatted DOCX and PDF files instantly.</p>
            </div>
          </div>

          <h2>The Technology</h2>
          <p>PaperAI is built on a modern, robust technology stack:</p>
          <ul>
            <li><strong>Frontend:</strong> Next.js App Router, React, Tailwind CSS</li>
            <li><strong>Editor:</strong> TipTap (ProseMirror) for a WYSIWYG experience</li>
            <li><strong>AI Pipeline:</strong> Google Gemini 1.5 Flash and OpenAI GPT-4o-mini</li>
            <li><strong>Backend & Auth:</strong> Supabase and Vercel Edge Functions</li>
          </ul>

          <div className="mt-12 text-center p-8 border border-brand/20 bg-brand/5 rounded-2xl">
            <h3 className="!mt-0 mb-4 text-xl font-bold">Ready to digitize your classroom?</h3>
            <Link href="/" className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 font-bold text-white hover:bg-brand/90 transition-colors no-underline">
              Try PaperAI Now
            </Link>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-white/40 flex flex-wrap gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
        </footer>
      </div>
    </div>
  );
}
