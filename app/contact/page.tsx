import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Github, Twitter } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | PaperAI",
  description: "Get in touch with the PaperAI support team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-brand/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="text-white/60 mb-8 pb-8 border-b border-white/10">We'd love to hear from you. Get in touch with our support team.</p>
        
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold mb-4 tracking-tight">Get in Touch</h2>
            <p className="text-white/80 leading-relaxed mb-6">
              Have questions about PaperAI, need technical support, or want to report an issue? Reach out to us via email and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-4">
              <a href="mailto:support@paperai.app" className="flex items-center gap-3 text-brand hover:underline font-medium">
                <Mail size={20} />
                support@paperai.app
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                <Github size={20} />
                GitHub Repository
              </a>
              <a href="#" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                <Twitter size={20} />
                @PaperAI_App
              </a>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-1">Business Hours</h3>
              <p className="text-sm text-white/60">Monday - Friday<br/>9:00 AM - 5:00 PM EST</p>
            </div>
          </div>

          <div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-brand focus:bg-white/10 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-brand focus:bg-white/10 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-brand focus:bg-white/10 transition-colors resize-y"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-md bg-brand px-4 py-2.5 font-bold text-white hover:bg-brand/90 transition-colors"
              >
                Send Message
              </button>
              <p className="text-xs text-white/40 text-center mt-2">This form is a placeholder. Please use the email link instead.</p>
            </form>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 text-sm text-white/40 flex flex-wrap gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-white transition-colors">About PaperAI</Link>
        </footer>
      </div>
    </div>
  );
}
