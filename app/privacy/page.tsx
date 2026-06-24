import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Textipe",
  description: "Privacy Policy for Textipe, the AI-powered OCR tool for educational documents.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-brand/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="text-white/60 mb-8 pb-8 border-b border-white/10">Last updated: June 2025</p>
        
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/80 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80">
          <h2>1. Introduction</h2>
          <p>Welcome to Textipe. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.</p>

          <h2>2. Data We Collect</h2>
          <p>We collect information that you provide directly to us:</p>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your email address and authentication credentials.</li>
            <li><strong>Document Data:</strong> Images and PDF files you upload for processing, and the resulting extracted text and HTML.</li>
            <li><strong>Usage Data:</strong> We automatically collect analytics data regarding how you interact with our application.</li>
          </ul>

          <h2>3. How We Process Data</h2>
          <p>Your documents are processed using third-party AI services to extract text and format it. By using Textipe, you consent to your uploaded documents being temporarily sent to:</p>
          <ul>
            <li><strong>Google Gemini:</strong> Used for fast, single-pass OCR and formatting.</li>
            <li><strong>OpenAI:</strong> Used as a fallback or alternative formatting engine.</li>
          </ul>
          <p>We do not use your personal documents to train our own AI models.</p>

          <h2>4. Data Storage</h2>
          <p>Your data, including uploaded files and generated projects, is securely stored using Supabase cloud infrastructure. Uploaded source files are stored in private storage buckets and are only accessible by you or through temporary signed URLs.</p>

          <h2>5. Cookies and Tracking</h2>
          <p>We use essential cookies to maintain your authentication session securely. We also use analytics tools (such as Google Analytics) to understand how our service is used and to improve the user experience.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Export your generated documents at any time.</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@textipe.app">support@textipe.app</a>.</p>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-white/40 flex flex-wrap gap-6">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Textipe</Link>
        </footer>
      </div>
    </div>
  );
}
