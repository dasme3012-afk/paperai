import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase server environment variables are missing.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components cannot always set cookies; route handlers can.
        }
      }
    }
  });
}

export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service environment variables are missing.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getEffectiveUser() {
  try {
    const authClient = await createServerSupabase();
    const {
      data: { user }
    } = await authClient.auth.getUser();

    if (user) {
      return user;
    }
  } catch (err) {
    console.warn("Failed to get authenticated user:", err);
  }

  // Fallback to offline guest if no user is found (Supabase broken, misconfigured, or missing cookies)
  const { headers } = await import("next/headers");
  const h = await headers();
  // Use IP to isolate mock DB per user
  const ip = h.get("x-forwarded-for") || "127.0.0.1";
  // Create a safe, deterministic ID from IP (replace non-alphanumerics)
  const safeIp = ip.replace(/[^a-zA-Z0-9]/g, "").substring(0, 12).padEnd(12, "0");
  
  return {
    id: `00000000-0000-0000-0000-${safeIp}`,
    email: "offline-guest@paperai.local"
  } as any;
}

// Global in-memory DB fallback for offline mode
const globalForDb = global as unknown as {
  mockProjects: Record<string, any>;
  mockDownloads: any[];
};

if (!globalForDb.mockProjects) {
  globalForDb.mockProjects = {};
}
if (!globalForDb.mockDownloads) {
  globalForDb.mockDownloads = [];
}

export const mockDb = globalForDb;


