"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User, Mail, LogOut, Settings } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#101113] dark:text-paper">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <Settings size={28} className="text-brand" /> Account Settings
        </h1>
        
        {loading ? (
          <div className="p-8 text-center text-black/50 dark:text-white/50 animate-pulse">Loading profile...</div>
        ) : user ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand text-2xl font-black">
                  {user.email?.charAt(0).toUpperCase() ?? "G"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.is_anonymous ? "Guest User" : "User Profile"}</h2>
                  <p className="text-sm text-black/60 dark:text-white/60 flex items-center gap-1.5 mt-1">
                    <Mail size={14} /> {user.email ?? "Anonymous Session"}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 pt-4 border-t border-line dark:border-white/10">
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/5 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-sm">Account Status</p>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      {user.is_anonymous ? "Temporary session. Progress will be lost if you clear cookies." : "Active and secured."}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3.5 font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        ) : (
          <div className="text-center p-8 rounded-xl border border-line bg-white dark:border-white/10 dark:bg-white/5">
            <User size={32} className="mx-auto text-black/30 dark:text-white/30 mb-4" />
            <p className="font-bold mb-1">Not logged in</p>
            <p className="text-sm text-black/50 dark:text-white/50 mb-4">Please sign in to view your profile.</p>
            <a href="/login" className="inline-block rounded-md bg-brand px-5 py-2 font-bold text-white">Sign In</a>
          </div>
        )}
      </div>
    </main>
  );
}
