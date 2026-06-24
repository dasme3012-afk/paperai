"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Mail, Lock, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type View = "sign-in" | "sign-up" | "forgot-password" | "magic-link" | "check-email";

export function LoginModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [view, setView] = useState<View>("sign-in");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function resetForm() {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  function switchView(newView: View) {
    resetForm();
    setView(newView);
  }

  // ── Email + Password Sign In ──
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success("Signed in successfully!");
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setLoading(false);
      console.warn("Auth failed:", err);
      toast.success("Demo Mode: Logging in as Guest!");
      onClose();
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
    }
  }

  // ── Email + Password Sign Up ──
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` }
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Account created & signed in!");
        onClose();
        window.location.reload();
      } else {
        switchView("check-email");
      }
    } catch (err) {
      setLoading(false);
      console.warn("Sign up failed:", err);
      toast.success("Demo Mode: Logging in as Guest!");
      onClose();
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
    }
  }

  // ── Forgot Password ──
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        switchView("check-email");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Failed to send reset email. Try again.");
    }
  }

  // ── Magic Link (Passwordless) ──
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` }
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        switchView("check-email");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Failed to send magic link. Try again.");
    }
  }

  // ── Google OAuth ──
  async function signInWithGoogle() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "select_account" }
        }
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.warn("Google sign in failed:", err);
      toast.success("Demo Mode: Logging in as Guest!");
      onClose();
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
    }
  }

  // ── Guest Login ──
  async function guestLogin() {
    toast.success("Logging in as Guest...");
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      toast.success("Guest session started!");
      onClose();
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.warn("Anonymous sign in failed, using fallback client-side guest:", err);
      onClose();
      setTimeout(() => { window.location.href = "/dashboard"; }, 500);
    } finally {
      setLoading(false);
    }
  }

  // ── Google Button Component ──
  const GoogleButton = ({ label }: { label: string }) => (
    <button
      onClick={signInWithGoogle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10 disabled:opacity-50 transition-all duration-200"
    >
      <svg className="h-4.5 w-4.5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
      </svg>
      <span>{label}</span>
    </button>
  );

  // ── Divider ──
  const Divider = () => (
    <div className="my-5 flex items-center text-xs text-white/30">
      <div className="h-px w-full bg-white/10" />
      <span className="px-3 font-semibold whitespace-nowrap">or</span>
      <div className="h-px w-full bg-white/10" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#151525] p-7 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ═══════════ SIGN IN VIEW ═══════════ */}
        {view === "sign-in" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center mb-4 select-none">
                <img src="/logo.png" alt="Textipe Logo" className="h-8 w-auto" />
              </div>
              <h1 className="text-2xl font-black">Welcome back</h1>
              <p className="mt-1 text-sm text-white/50">Sign in to your account</p>
            </div>

            <GoogleButton label="Continue with Google" />
            <Divider />

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="si-email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="si-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="teacher@school.edu" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold" htmlFor="si-pass">Password</label>
                  <button type="button" onClick={() => switchView("forgot-password")}
                    className="text-xs text-brand hover:underline cursor-pointer">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="si-pass" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Magic Link */}
            <button onClick={() => switchView("magic-link")}
              className="w-full mt-3 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2">
              <Mail size={13} /> Sign in with Magic Link (no password)
            </button>

            <p className="mt-5 text-center text-xs text-white/50">
              Don&apos;t have an account?{" "}
              <button onClick={() => switchView("sign-up")} className="font-bold text-brand hover:underline cursor-pointer">
                Create one
              </button>
            </p>

            <div className="mt-5 pt-4 border-t border-white/10">
              <button onClick={guestLogin}
                className="w-full rounded-lg border border-dashed border-white/15 bg-transparent py-2 text-xs font-bold text-white/40 hover:text-brand hover:border-brand transition-colors cursor-pointer">
                Try Demo Mode (No Login Required)
              </button>
            </div>
          </>
        )}

        {/* ═══════════ SIGN UP VIEW ═══════════ */}
        {view === "sign-up" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center mb-4 select-none">
                <img src="/logo.png" alt="Textipe Logo" className="h-8 w-auto" />
              </div>
              <h1 className="text-2xl font-black">Create account</h1>
              <p className="mt-1 text-sm text-white/50">Start digitizing exam papers in seconds</p>
            </div>

            <GoogleButton label="Sign up with Google" />
            <Divider />

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="su-email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="su-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="teacher@school.edu" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="su-pass">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="su-pass" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="Min 6 characters" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="su-confirm">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="su-confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required minLength={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="Re-enter your password" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-white/50">
              Already have an account?{" "}
              <button onClick={() => switchView("sign-in")} className="font-bold text-brand hover:underline cursor-pointer">
                Sign In
              </button>
            </p>
          </>
        )}

        {/* ═══════════ FORGOT PASSWORD VIEW ═══════════ */}
        {view === "forgot-password" && (
          <>
            <button onClick={() => switchView("sign-in")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white mb-5 transition-colors cursor-pointer">
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                <Lock size={20} className="text-brand" />
              </div>
              <h1 className="text-2xl font-black">Reset password</h1>
              <p className="mt-1 text-sm text-white/50">Enter your email and we&apos;ll send you a reset link</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="fp-email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="fp-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoFocus
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="teacher@school.edu" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {/* ═══════════ MAGIC LINK VIEW ═══════════ */}
        {view === "magic-link" && (
          <>
            <button onClick={() => switchView("sign-in")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white mb-5 transition-colors cursor-pointer">
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                <Mail size={20} className="text-brand" />
              </div>
              <h1 className="text-2xl font-black">Magic link</h1>
              <p className="mt-1 text-sm text-white/50">We&apos;ll email you a link to sign in — no password needed</p>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" htmlFor="ml-email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="ml-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoFocus
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 outline-none focus:border-brand text-sm transition-colors"
                    placeholder="teacher@school.edu" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </>
        )}

        {/* ═══════════ CHECK EMAIL VIEW ═══════════ */}
        {view === "check-email" && (
          <>
            <div className="text-center py-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5">
                <Mail size={28} className="text-green-400" />
              </div>
              <h1 className="text-2xl font-black">Check your email</h1>
              <p className="mt-2 text-sm text-white/50 max-w-xs mx-auto">
                We&apos;ve sent an email to <strong className="text-white">{email}</strong>. Click the link in the email to continue.
              </p>
              <p className="mt-4 text-xs text-white/30">
                Didn&apos;t receive it? Check your spam folder.
              </p>
              <button onClick={() => switchView("sign-in")}
                className="mt-6 rounded-lg border border-white/10 px-6 py-2 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
