import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | PaperAI",
  description: "Terms of Service for PaperAI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-brand/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="text-white/60 mb-8 pb-8 border-b border-white/10">Last updated: June 2025</p>
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/80 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using PaperAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

          <h2>2. Service Description</h2>
          <p>PaperAI is an AI-powered OCR tool designed to help educators digitize and format physical question papers, worksheets, and educational documents.</p>

          <h2>3. Account Responsibilities</h2>
          <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2>4. Acceptable Use</h2>
          <p>You agree to use PaperAI only for lawful purposes. You must not:</p>
          <ul>
            <li>Upload documents containing illegal, offensive, or sensitive personal information.</li>
            <li>Use the service to process documents you do not have the right to process or distribute.</li>
            <li>Attempt to reverse engineer, disrupt, or compromise the integrity of the service.</li>
          </ul>

          <h2>5. AI-Generated Content Disclaimer</h2>
          <p>PaperAI uses advanced artificial intelligence to extract and format text. However, AI makes mistakes. <strong>You are solely responsible for reviewing and verifying the accuracy of all generated content before using it in any educational setting.</strong> We do not guarantee 100% accuracy of the OCR or formatting process.</p>

          <h2>6. Intellectual Property</h2>
          <p>You retain all your ownership rights in the documents you upload. We claim no intellectual property rights over the material you provide to the service.</p>

          <h2>7. Limitation of Liability</h2>
          <p>In no event shall PaperAI, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to, use of, or inability to use the service.</p>

          <h2>8. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.</p>

          <h2>9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@paperai.app">support@paperai.app</a>.</p>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-white/40 flex flex-wrap gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="/about" className="hover:text-white transition-colors">About PaperAI</Link>
        </footer>
      </div>
    </div>
  );
}
