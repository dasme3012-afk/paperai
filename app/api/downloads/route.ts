import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidHttpUrl } from "@/lib/setup-status";
import { createServerSupabase, createServiceSupabase, getEffectiveUser } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, errorResponse } from "@/lib/api-utils";
import { log } from "@/lib/logger";

const schema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(["pdf", "docx"])
});

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rl = rateLimit(`downloads-get:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    if (!isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ downloads: [] });
    }

    const user = await getEffectiveUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("download_history")
      .select("id, project_id, export_type, created_at, projects(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) return NextResponse.json({ error: "Failed to fetch downloads." }, { status: 500 });
    return NextResponse.json({ downloads: data ?? [] });
  } catch (error) {
    return errorResponse(error, "downloads-get");
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rl = rateLimit(`downloads-post:${ip}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    if (!isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true, skipped: "Supabase is not configured." });
    }

    const user = await getEffectiveUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const input = schema.parse(await request.json());
    const supabase = createServiceSupabase();
    const { error } = await supabase.from("download_history").insert({
      user_id: user.id,
      project_id: input.projectId,
      export_type: input.type
    });

    if (error) return NextResponse.json({ error: "Failed to record download." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "downloads-post");
  }
}
