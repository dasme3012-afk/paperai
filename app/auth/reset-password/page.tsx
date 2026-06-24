"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase will have set the session from the URL hash automatically
    // We just need to verify the user is authenticated
    const checkSession = async () => {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
        } else {
          toast.error("Invalid or expired reset link. Please request a new one.");
          router.push("/login");
        }
      } catch {
        setReady(true); // Allow form to render in case of Supabase misconfiguration
      }
    };
    checkSession();
  }, [router]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success("Password updated successfully!");
        router.push("/dashboard");
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151525] p-7 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="text-lg font-black tracking-tight">PaperAI</span>
          </Link>
          <h1 className="text-2xl font-black">Set new password</h1>
          <p className="mt-1 text-sm text-white/50">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" htmlFor="new-pass">New password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="new-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" htmlFor="confirm-pass">Confirm new password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="confirm-pass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          {/* Password strength indicator */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                password.length >= i * 3
                  ? password.length >= 12 ? "bg-green-400" : password.length >= 8 ? "bg-yellow-400" : "bg-red-400"
                  : "bg-white/10"
              }`} />
            ))}
          </div>
          <p className="text-xs text-white/30">
            {password.length === 0 ? "" : password.length < 6 ? "Too short" : password.length < 8 ? "Weak" : password.length < 12 ? "Good" : "Strong"}
          </p>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  );
}
