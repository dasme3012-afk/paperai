import { NextResponse } from "next/server";
import { isValidHttpUrl } from "@/lib/setup-status";
import { createServerSupabase, createServiceSupabase, getEffectiveUser, mockDb } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, errorResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rl = rateLimit(`projects-list:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    if (!isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ projects: [] });
    }

    const user = await getEffectiveUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceSupabase();
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ projects: data ?? [] });
    } catch (err) {
      console.warn("Supabase fetch projects failed, falling back to mock projects:", err);
      const projects = Object.values(mockDb.mockProjects).filter((p: any) => p.user_id === user.id);
      return NextResponse.json({ projects });
    }
  } catch (error) {
    return errorResponse(error, "projects-list");
  }
}
