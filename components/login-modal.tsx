"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      if (isSignUp) {
        // Sign Up (Create Account)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`
          }
        });
        setLoading(false);
        if (error) {
          toast.error(error.message);
        } else {
          if (data.session) {
            toast.success("Account created and signed in!");
            onClose();
            window.location.reload();
          } else {
            toast.success("Account created! Check your email for verification.");
            onClose();
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        setLoading(false);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Signed in successfully!");
          onClose();
          window.location.reload();
        }
      }
    } catch (err) {
      setLoading(false);
      console.warn("Authentication failed, falling back to guest mode:", err);
      toast.success("Demo Mode: Logging in as Guest!");
      onClose();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account"
          }
        }
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.warn("Google sign in failed, falling back to guest mode:", err);
      toast.success("Demo Mode: Logging in as Guest!");
      onClose();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }

  function guestLogin() {
    toast.success("Logging in as Guest...");
    onClose();
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <section className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#151525] text-ink dark:text-paper animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
          title="Close modal"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <span className="text-2xl font-black text-brand">PaperAI</span>
          <h1 className="mt-4 text-2xl font-black">
            {isSignUp ? "Create account" : "Sign in"}
          </h1>
          <p className="mt-1 text-xs text-black/65 dark:text-white/65">
            {isSignUp ? "Start digitizing exam papers in seconds." : "Welcome back! Enter your details to log in."}
          </p>
        </div>

        {/* Google sign-in button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-line bg-transparent px-4 py-2.5 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center justify-between text-xs text-black/35 dark:text-white/35">
          <div className="h-px w-full bg-line dark:bg-white/10" />
          <span className="px-3 font-semibold">or</span>
          <div className="h-px w-full bg-line dark:bg-white/10" />
        </div>

        {/* Email & Password login form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold" htmlFor="modal-email">Email address</label>
            <input
              id="modal-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1.5 w-full rounded-md border border-line bg-transparent px-3 py-2 outline-none focus:border-brand dark:border-white/15 text-sm"
              placeholder="teacher@school.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold" htmlFor="modal-password">Password</label>
            <input
              id="modal-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={6}
              className="mt-1.5 w-full rounded-md border border-line bg-transparent px-3 py-2 outline-none focus:border-brand dark:border-white/15 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2.5 font-bold text-white disabled:opacity-50 text-sm transition-opacity"
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <p className="mt-5 text-center text-xs text-black/60 dark:text-white/60">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-brand hover:underline"
          >
            {isSignUp ? "Sign In" : "Create one"}
          </button>
        </p>

        {/* Guest fallback button */}
        <div className="mt-6 pt-4 border-t border-line dark:border-white/10">
          <button
            onClick={guestLogin}
            className="w-full rounded-md border border-dashed border-line dark:border-white/15 bg-transparent py-2 text-xs font-bold text-black/60 dark:text-white/60 hover:text-brand hover:border-brand dark:hover:text-brand dark:hover:border-brand transition-colors"
          >
            Try Demo Mode (No Login Required)
          </button>
        </div>
      </section>
    </div>
  );
}
